import LoginForm from "./components/LoginForm";   
    function LoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center">

            
            <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVNLqqceLeycBmJVZ1rcZwrXFX4zeeMpwZIw&s"
                alt="Fondo biblioteca"
                className="absolute inset-0 w-full h-full object-cover"
            />

            
            <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-sm"></div>

        
            <div className="relative z-10">
                <LoginForm />
            </div>

        </div>
    );
    }

    export default LoginPage;