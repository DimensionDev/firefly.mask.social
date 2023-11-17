'use client'

import Image from "next/image"
import { useCallback, Fragment, useState } from "react"
import { LensSocialMedia } from "@/providers/lens/SocialMedia.js"
import { Dialog, Transition } from '@headlessui/react'
import { LoginFarcaster } from "@/components/LoginFarcaster.js"

const loginActions = [
  { name: "Lens", logo: '/svg/lens.svg' },
  { name: "Farcaster", logo: '/svg/farcaster.svg' }
]

interface LoginModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function LoginModal({ isOpen, setIsOpen }: LoginModalProps) {
  const [farcasterOpen, setFarcasterOpen] = useState(false)
  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const loginLens = useCallback(() => {
    const lensProvider = new LensSocialMedia()
    lensProvider.createSession()
  }, [])
  return <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/25" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="transform transition-all bg-white rounded-[12px]">
              {!farcasterOpen ?
                <div className="w-[600px] flex flex-col rounded-[12px]" style={{ boxShadow: "0px 4px 30px 0px rgba(0, 0, 0, 0.10)" }}>
                  <div className="w-[600px] rounded-t-[12px] h-[56px] p-4 bg-gradient-to-b from-white to-white justify-center items-center gap-2 inline-flex">
                    <button onClick={() => { setIsOpen(false) }}>
                      <Image className="w-[24px] h-[24px] relative" src='/svg/close.svg' alt="close" width={24} height={24} />
                    </button>
                    <div className="grow shrink basis-0 text-center text-slate-950 text-lg font-bold font-['Helvetica'] leading-snug">Login</div>
                    <div className="w-[24px] h-[24px] relative" />
                  </div>
                  <div className="flex flex-col gap-[16px] w-full p-[16px] ">
                    {loginActions.map(({ name, logo }) =>
                      <button className="flex flex-col p-[16px] group hover:bg-lightBg rounded-lg" key={name} onClick={() => { name === "Lens" ? loginLens() : setFarcasterOpen(true) }}>
                        <div className="w-full px-[16px] py-[24px] rounded-lg flex-col justify-start items-center gap-[8px] inline-flex">
                          <div className="w-[48px] h-[48px] relative">
                            <Image className="left-0 top-0 rounded-full" src={logo} width={48} height={48} alt='lens' />
                          </div>
                          <div className="text-lightSecond text-sm font-bold font-['Helvetica'] group-hover:text-textMain leading-[18px]">{name}</div>
                        </div>
                      </button>)}
                  </div>
                </div> : <LoginFarcaster closeFarcaster={() => { setFarcasterOpen(false) }} />}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>


}