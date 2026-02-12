
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";

export const helvetica = localFont({
    src: [
        {
            path: "./fonts/Helvetica.woff",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/Helvetica-Bold.woff",
            weight: "700",
            style: "normal",
        },
        {
            path: "./fonts/Helvetica-Oblique.woff",
            weight: "400",
            style: "italic",
        },
        {
            path: "./fonts/Helvetica-BoldOblique.woff",
            weight: "700",
            style: "italic",
        },
    ],
    variable: "--font-helvetica",
});

export const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    weight: ["400"],
    style: ["normal", "italic"],
    display: "swap",
});
