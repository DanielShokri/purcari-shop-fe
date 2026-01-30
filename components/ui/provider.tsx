"use client"

import { ChakraProvider, LocaleProvider } from "@chakra-ui/react"
import { system } from "../../theme"
import { ColorModeProvider } from "./color-mode"
import { Toaster } from "./toaster"

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <LocaleProvider locale="he-IL">
        <ColorModeProvider>
          {children}
          <Toaster />
        </ColorModeProvider>
      </LocaleProvider>
    </ChakraProvider>
  )
}
