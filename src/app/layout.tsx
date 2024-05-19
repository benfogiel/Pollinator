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
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
