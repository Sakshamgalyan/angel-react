import { useDispatch, useSelector } from "react-redux";
import Button from "../ui/Button";
import Input from "../ui/Input"
import { AppDispatch, RootState } from "@/store";
import { login, updateLoginForm, setLoginErrors } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { status, error, loginForm, loginErrors } = useSelector((state: RootState) => state.auth);
    const { identifier, password } = loginForm;
    const router = useRouter();

    const handleLogin = async () => {
        let errors: typeof loginErrors = {};
        if (!identifier) errors.identifier = "Email/Username is required";
        if (!password) errors.password = "Password is required";

        if (Object.keys(errors).length > 0) {
            dispatch(setLoginErrors(errors));
            return;
        }

        const result = await dispatch(login({ identifier, password }));
        if (login.fulfilled.match(result)) {
            router.push("/home")
        }
    };

    const isLoading = status === 'loading';

    return (
        <div className='space-y-4 mt-6 max-w-[400px] mx-auto'>
            <Input
                label="Email / Username / Mobile Number"
                type="text"
                value={identifier}
                onChange={(e) => dispatch(updateLoginForm({ identifier: e.target.value }))}
                placeholder="Enter your email"
                error={loginErrors?.identifier}
            />
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => dispatch(updateLoginForm({ password: e.target.value }))}
                placeholder="Enter your password"
                error={loginErrors?.password}
            />
            <Button
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                onClick={handleLogin}
            >
                Login
            </Button>
            {error && <p className="text-red-500">{error}</p>}
            {loginErrors?.general && <p className="text-red-500">{loginErrors.general}</p>}
        </div>
    )
}

export default Login