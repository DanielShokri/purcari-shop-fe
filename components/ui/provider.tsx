"use client"

import { ChakraProvider, LocaleProvider } from "@chakra-ui/react"
import { system } from "../../theme"
import { ColorModeProvider } from "./color-mode"

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <LocaleProvider locale="he-IL">
        <ColorModeProvider>
          {children}
        </ColorModeProvider>
      </LocaleProvider>
    </ChakraProvider>
  )
}
