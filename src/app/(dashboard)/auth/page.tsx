import LoginModal from "@/components/auth/LoginModal"
import Image from "next/image"

const Auth = () => {
    return (
        <div className="min-h-screen bg-black relative flex items-center justify-center">
            <Image
                src="/authbg.jpg"
                alt="bg"
                fill
                className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <LoginModal />
        </div>
    )
}

export default Auth