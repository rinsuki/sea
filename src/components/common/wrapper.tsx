import React from "react"

export function Wrapper(props: { children: any }) {
    return (
        <html>
            <head>
                <meta charSet="UTF-8" />
                <meta name="robots" content="noindex" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
                <section>{props.children}</section>
            </body>
        </html>
    )
}
