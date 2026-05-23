export const metadata = {
  title: "RoomMind",
  description: "Tell us what to keep, and we plan the rest.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#faf9f6",
          color: "#1c1c1a",
        }}
      >
        {children}
      </body>
    </html>
  );
}
