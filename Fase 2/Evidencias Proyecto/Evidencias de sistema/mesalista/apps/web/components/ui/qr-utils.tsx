import { CSSProperties } from 'react'
import qrcodegen from '@/utils/qr-code-gen'

export type Modules = ReturnType<qrcodegen.QrCode['getModules']>
export type Excavation = { x: number; y: number; w: number; h: number }

export const ERROR_LEVEL_MAP: { [index: string]: qrcodegen.QrCode.Ecc } = {
  L: qrcodegen.QrCode.Ecc.LOW,
  M: qrcodegen.QrCode.Ecc.MEDIUM,
  Q: qrcodegen.QrCode.Ecc.QUARTILE,
  H: qrcodegen.QrCode.Ecc.HIGH
}

export const DEFAULT_SIZE = 128
export const DEFAULT_LEVEL = 'L'
export const DEFAULT_BGCOLOR = '#FFFFFF'
export const DEFAULT_FGCOLOR = '#000000'
export const DEFAULT_INCLUDEMARGIN = false

export const MARGIN_SIZE = 4

export const QR_LEVELS = ['L', 'M', 'Q', 'H'] as const

export type ImageSettings = {
  src: string
  height: number
  width: number
  excavate: boolean
  x?: number
  y?: number
}

export type QRProps = {
  value: string
  size?: number
  level?: string
  bgColor?: string
  fgColor?: string
  style?: CSSProperties
  includeMargin?: boolean
  imageSettings?: ImageSettings
  isOGContext?: boolean
}

export type QRPropsCanvas = QRProps &
  React.CanvasHTMLAttributes<HTMLCanvasElement>
export type QRPropsSVG = QRProps & React.SVGProps<SVGSVGElement>

// We could just do this in generatePath, except that we want to support
// non-Path2D canvas, so we need to keep it an explicit step.
export function excavateModules(
  modules: Modules,
  excavation: Excavation
): Modules {
  return modules.slice().map((row, y) => {
    if (y < excavation.y || y >= excavation.y + excavation.h) {
      return row
    }
    return row.map((cell, x) => {
      if (x < excavation.x || x >= excavation.x + excavation.w) {
        return cell
      }
      return false
    })
  })
}

export function convertImageSettingsToPixels(
  calculatedImageSettings: {
    x: number
    y: number
    w: number
    h: number
    excavation: Excavation | null
  },
  size: number,
  numCells: number
): {
  imgWidth: number
  imgHeight: number
  imgLeft: number
  imgTop: number
} {
  const pixelRatio = size / numCells
  const imgWidth = calculatedImageSettings.w * pixelRatio
  const imgHeight = calculatedImageSettings.h * pixelRatio
  const imgLeft = calculatedImageSettings.x * pixelRatio
  const imgTop = calculatedImageSettings.y * pixelRatio

  return { imgWidth, imgHeight, imgLeft, imgTop }
}

export function generatePath(modules: Modules, margin = 0): string {
  const ops: Array<string> = []
  modules.forEach(function (row, y) {
    let start: number | null = null
    row.forEach(function (cell, x) {
      if (!cell && start !== null) {
        // M0 0h7v1H0z injects the space with the move and drops the comma,
        // saving a char per operation
        ops.push(
          `M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`
        )
        start = null
        return
      }

      // end of row, clean up or skip
      if (x === row.length - 1) {
        if (!cell) {
          // We would have closed the op above already so this can only mean
          // 2+ light modules in a row.
          return
        }
        if (start === null) {
          // Just a single dark module.
          ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`)
        } else {
          // Otherwise finish the current line.
          ops.push(
            `M${start + margin},${y + margin} h${x + 1 - start}v1H${
              start + margin
            }z`
          )
        }
        return
      }

      if (cell && start === null) {
        start = x
      }
    })
  })
  return ops.join('')
}

// This is *very* rough estimate of max amount of QRCode allowed to be covered.
// It is "wrong" in a lot of ways (area is a terrible way to estimate, it
// really should be number of modules covered), but if for some reason we don't
// get an explicit height or width, I'd rather default to something than throw.
export const DEFAULT_IMG_SCALE = 0.1
export function QRCodeSVG(props: QRPropsSVG) {
  const {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    includeMargin = DEFAULT_INCLUDEMARGIN,
    isOGContext = false,
    imageSettings,
    ...otherProps
  } = props

  const shouldUseHigherErrorLevel =
    isOGContext && imageSettings?.excavate && (level === 'L' || level === 'M')

  // Use a higher error correction level 'Q' when excavation is enabled
  // to ensure the QR code remains scannable despite the removed modules.
  const effectiveLevel = shouldUseHigherErrorLevel ? 'Q' : level

  let cells = qrcodegen.QrCode.encodeText(
    value,
    ERROR_LEVEL_MAP[effectiveLevel]
  ).getModules()

  const margin = includeMargin ? MARGIN_SIZE : 0
  const numCells = cells.length + margin * 2
  const calculatedImageSettings = getImageSettings(
    cells,
    size,
    includeMargin,
    imageSettings
  )

  let image: null | JSX.Element = null
  if (imageSettings != null && calculatedImageSettings != null) {
    if (calculatedImageSettings.excavation != null) {
      cells = excavateModules(cells, calculatedImageSettings.excavation)
    }

    if (isOGContext) {
      const { imgWidth, imgHeight, imgLeft, imgTop } =
        convertImageSettingsToPixels(calculatedImageSettings, size, numCells)

      image = (
        <img
          src={imageSettings.src}
          alt="Logo"
          style={{
            position: 'absolute',
            left: `${imgLeft}px`,
            top: `${imgTop}px`,
            width: `${imgWidth}px`,
            height: `${imgHeight}px`
          }}
        />
      )
    } else {
      image = (
        <image
          href={imageSettings.src}
          height={calculatedImageSettings.h}
          width={calculatedImageSettings.w}
          x={calculatedImageSettings.x + margin}
          y={calculatedImageSettings.y + margin}
          preserveAspectRatio="none"
        />
      )
    }
  }

  // Drawing strategy: instead of a rect per module, we're going to create a
  // single path for the dark modules and layer that on top of a light rect,
  // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
  // way faster than DOM ops.
  // For level 1, 441 nodes -> 2
  // For level 40, 31329 -> 2
  const fgPath = generatePath(cells, margin)

  return (
    <svg
      height={size}
      width={size}
      viewBox={`0 0 ${numCells} ${numCells}`}
      {...otherProps}
    >
      <path
        fill={bgColor}
        d={`M0,0 h${numCells}v${numCells}H0z`}
        shapeRendering="crispEdges"
      />
      <path fill={fgColor} d={fgPath} shapeRendering="crispEdges" />
      {image}
    </svg>
  )
}

export function getImageSettings(
  cells: Modules,
  size: number,
  includeMargin: boolean,
  imageSettings?: ImageSettings
): null | {
  x: number
  y: number
  h: number
  w: number
  excavation: Excavation | null
} {
  if (imageSettings == null) {
    return null
  }
  const margin = includeMargin ? MARGIN_SIZE : 0
  const numCells = cells.length + margin * 2
  const defaultSize = Math.floor(size * DEFAULT_IMG_SCALE)
  const scale = numCells / size
  const w = (imageSettings.width || defaultSize) * scale
  const h = (imageSettings.height || defaultSize) * scale
  const x =
    imageSettings.x == null ? cells.length / 2 - w / 2 : imageSettings.x * scale
  const y =
    imageSettings.y == null ? cells.length / 2 - h / 2 : imageSettings.y * scale

  let excavation: Excavation | null = null
  if (imageSettings.excavate) {
    const floorX = Math.floor(x)
    const floorY = Math.floor(y)
    const ceilW = Math.ceil(w + x - floorX)
    const ceilH = Math.ceil(h + y - floorY)
    excavation = { x: floorX, y: floorY, w: ceilW, h: ceilH }
  }

  return { x, y, h, w, excavation }
}

export function getQRData({
  url,
  fgColor,
  hideLogo = true,
  logo
}: {
  url: string
  fgColor?: string
  hideLogo?: boolean
  logo?: string
  scale?: number
}) {
  return {
    value: `${url}`,
    bgColor: '#ffffff',
    fgColor,
    size: 1024,
    level: 'Q', // QR Code error correction level: https://blog.qrstuff.com/general/qr-code-error-correction
    hideLogo,
    includeMargin: false,
    ...(!hideLogo && {
      imageSettings: {
        src: logo || '',
        height: 256,
        width: 256,
        excavate: true
      }
    })
  }
}
