import { Body, Head, Html, Preview } from '@react-email/components'

export const VerificationMessage = ({
  verificationCode
}: {
  verificationCode: string
}) => {
  return (
    <Html>
      <Head>
        <title>Use this code to verify your account in Mesalista</title>
        <Preview>Use this code to verify your account in Mesalista</Preview>
        <Body>
          <p>Use this code to verify your account in Mesalista: </p>
          <strong>{verificationCode}</strong>
        </Body>
      </Head>
    </Html>
  )
}

export default VerificationMessage
