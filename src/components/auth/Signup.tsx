import Input from "../ui/Input";
import Button from "../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { signup, updateSignupForm, setSignupErrors } from "@/store/slices/authSlice";

const Signup = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { status, error, signupForm, signupErrors } = useSelector((state: RootState) => state.auth);
    const { name, email, mobile, username, password } = signupForm;

    const handleSignup = async () => {
        let errors: typeof signupErrors = {};
        if (!name) errors.name = "Name is required";
        if (!email) errors.email = "Email is required";
        if (!username) errors.username = "Username is required";
        if (!mobile) errors.mobile = "Mobile number is required";
        if (!password) errors.password = "Password is required";

        if (Object.keys(errors).length > 0) {
            dispatch(setSignupErrors(errors));
            return;
        }

        const result = await dispatch(signup({
            name,
            email,
            mobile,
            password,
            username
        }));

        if (signup.fulfilled.match(result)) {
            console.log("Signup success");
            // Optionally dispatch resetForms() here or on unmount
        }
    };

    const isLoading = status === 'loading';

    return (
        <div className='space-y-4 mt-6 max-w-[400px] mx-auto'>
            <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => dispatch(updateSignupForm({ name: e.target.value }))}
                placeholder="Enter your name"
                error={signupErrors?.name}
            />
            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => dispatch(updateSignupForm({ email: e.target.value }))}
                placeholder="Enter your email"
                error={signupErrors?.email}
            />
            <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => dispatch(updateSignupForm({ username: e.target.value }))}
                placeholder="Enter your username"
                error={signupErrors?.username}
            />
            <Input
                label="Mobile Number"
                type="number"
                value={mobile}
                onChange={(e) => dispatch(updateSignupForm({ mobile: e.target.value }))}
                placeholder="Enter your mobile number"
                error={signupErrors?.mobile}
            />
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => dispatch(updateSignupForm({ password: e.target.value }))}
                placeholder="Enter your password"
                error={signupErrors?.password}
            />
            <Button
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                onClick={handleSignup}
            >
                Signup
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {signupErrors?.general && <p className="text-red-500 text-sm">{signupErrors.general}</p>}
        </div>
    )
}

export default Signup