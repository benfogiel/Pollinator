import "../index.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pollinator",
    description: "App to control LED flowers.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/x-icon"
                    sizes="64x64 32x32 24x24 16x16"
                    href="/favicon.ico"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="192x192"
                    href="/logo192.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="512x512"
                    href="/logo512.png"
                />
                <link rel="manifest" href="/manifest.json" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black"
                />
                <meta name="apple-mobile-web-app-title" content="Pollinator" />
                <meta name="theme-color" content="#191919" />
            </head>
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
