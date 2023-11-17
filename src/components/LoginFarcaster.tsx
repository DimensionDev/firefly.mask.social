'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { WarpcastSocialMedia } from "@/providers/warpcast/SocialMedia.js"
import QRCode from 'react-qr-code'

export function LoginFarcaster() {
  const [url, setUrl] = useState("")

  async function login() {
    const warpcastProvider = new WarpcastSocialMedia()
    warpcastProvider.createSessionByGrantPermission(setUrl)
  }

  useEffect(() => {
    login()
  }, [])

  return <div className="w-[600px] flex flex-col rounded-[12px]" style={{ boxShadow: "0px 4px 30px 0px rgba(0, 0, 0, 0.10)" }}>
    <div className="w-full rounded-t-[12px] h-[56px] p-4 bg-gradient-to-b from-white to-white justify-center items-center gap-2 inline-flex">
      <button onClick={() => { }}>
        <Image className="w-[24px] h-[24px] relative" src='/svg/leftArrow.svg' alt="close" width={24} height={24} />
      </button>
      <div className="grow shrink basis-0 text-center text-slate-950 text-lg font-bold font-['Helvetica'] leading-snug">Log in with Farcaster account</div>
      <div className="w-[24px] h-[24px] relative" />
    </div>
    <div className="flex flex-col gap-[16px] w-full p-[16px] min-h-[475px] items-center ">
      <div className=" text-[12px] text-lightSecond text-center leading-[16px]">Log in to your Farcaster account by scanning this QR code using mobile application Warpcast.</div>
      {url ? <QRCode value={url} size={330} /> : null}
    </div>
  </div>

}