import BackgroundShapes from "@/components/BackgroundShapes";
import LoginHero from "@/components/LoginHero";

export default function AuthLayout({
    image = '',
    type = 'login',
    children,
}: {
    image?: string;
    type?: 'login' | 'register';
    children: React.ReactNode;
}) {
    return (
        <section className={`${type === 'login' ? '_social_login_wrapper' : '_social_registration_wrapper'} _layout_main_wrapper`}>
            <BackgroundShapes />
            <div className={` ${type === 'login' ? '_social_login_wrap' : '_social_registration_wrap'}`}>
                <div className="container">
                    <div className="row align-items-center">
                        <LoginHero image={image} type={type} />
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}
