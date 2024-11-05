'use client'

import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFullScreen}
      className="fixed bottom-4 right-4"
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </Button>
  )
}
