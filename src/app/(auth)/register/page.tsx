import Header from './_components/Header'
import RegisterForm from './_components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto max-h-[900px] flex flex-col justify-center space-y-6">
          <Header />

          <div className="w-full">
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  )
}
