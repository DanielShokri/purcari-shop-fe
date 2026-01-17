"use client"

import { IconButton, ClientOnly, Skeleton } from "@chakra-ui/react"
import type { IconButtonProps } from "@chakra-ui/react"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import React, { forwardRef } from "react"

export function ColorModeProvider(props: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "light" ? light : dark
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return (
    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
      {colorMode === "light" ? "dark_mode" : "light_mode"}
    </span>
  )
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" rounded="md" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        p="2"
        color="fg.muted"
        _hover={{ color: 'fg', bg: 'bg.subtle' }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

export function LightMode(props: React.ComponentProps<"span">) {
  return (
    <span data-theme="light" className="light" {...props} />
  )
}

export function DarkMode(props: React.ComponentProps<"span">) {
  return (
    <span data-theme="dark" className="dark" {...props} />
  )
}
