import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <style dangerouslySetInnerHTML={{ __html: ScrollViewStyleReset }} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                margin: 0;
                padding: 0;
                background-color: #ffffff !important;
              }
              #root {
                margin: 0;
                padding: 0;
                background-color: #ffffff !important;
              }
            `,
          }}
        />
        <title>My App</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#ffffff' }}>
        <div id="root" style={{ margin: 0, padding: 0, backgroundColor: '#ffffff' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
