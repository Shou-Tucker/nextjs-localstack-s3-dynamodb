import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LocalStack S3 & DynamoDB Demo',
  description: 'A demo application using LocalStack with S3 and DynamoDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">LocalStack S3 & DynamoDB Demo</h1>
          </header>
          <main className="flex-grow p-4">
            {children}
          </main>
          <footer className="bg-gray-100 p-4 text-center text-gray-500 text-sm">
            Demo application showcasing S3 and DynamoDB with LocalStack
          </footer>
        </div>
      </body>
    </html>
  )
}
