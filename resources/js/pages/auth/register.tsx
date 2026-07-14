import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import RegistrationForm from '@/components/RegisterForm';
import { login } from '@/routes';


export default function Register() {
    return (
        <>
            <Head title="Register" />

            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                <div className="_social_registration_content">
                    <div className="_social_registration_right_logo _mar_b28">
                        <img
                            src="/assets/images/logo.svg"
                            alt="Image"
                            className="_right_logo"
                        />
                    </div>

                    <p className="_social_registration_content_para _mar_b8">
                        Get Started Now
                    </p>

                    <h4 className="_social_registration_content_title _titl4 _mar_b50">
                        Registration
                    </h4>

                    {/* <GoogleSignInButton className="_social_registration_content_btn _mar_b40" onClick={() => { }} />

                    <div className="_social_registration_content_bottom_txt _mar_b40">
                        <span>Or</span>
                    </div> */}

                    <RegistrationForm />

                    <div className="row">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <div className="_social_registration_bottom_txt">
                                <p className="_social_registration_bottom_txt_para">
                                    Have an account?{" "}
                                    <Link href={login()}>
                                        Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


Register.layout = {
    image: "/assets/images/registration.png",
    type: "register",
}


