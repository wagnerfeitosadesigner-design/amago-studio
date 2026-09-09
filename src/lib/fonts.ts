import { Inter } from "next/font/google";

/*
  TIPOGRAFIA
  ----------
  A identidade pede "Amago Sans" (arquivo custom) como fonte principal.
  Enquanto o arquivo não é fornecido, usamos Inter (o fallback definido na
  identidade) para o projeto rodar imediatamente.

  Quando você tiver o arquivo, coloque-o em /public/fonts e troque por:

    import localFont from "next/font/local";
    export const fontSans = localFont({
      src: [
        { path: "../../public/fonts/AmagoSans-Regular.woff2", weight: "400", style: "normal" },
        { path: "../../public/fonts/AmagoSans-Medium.woff2",  weight: "500", style: "normal" },
        { path: "../../public/fonts/AmagoSans-Bold.woff2",    weight: "700", style: "normal" },
      ],
      variable: "--font-sans",
      display: "swap",
      fallback: ["Inter", "system-ui", "sans-serif"],
    });

  E aponte --font-display para a mesma variável.
*/

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display usa a mesma família por enquanto (Amago Sans é display + corpo).
export const fontDisplay = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
