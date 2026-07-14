
import FormInput from "./FormInput";
import RememberForgotRow from "./RememberForgotRow";
import { store } from '@/routes/register';
import { Form } from "@inertiajs/react";

export default function RegisterForm() {
    return (
        <Form
            {...store.form()}
            resetOnSuccess={["password"]}
            className="_social_registration_form"
        >
            {({ processing, errors }) => (
                <>
                    <div className="row">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <FormInput
                                id="first_name"
                                name="first_name"
                                label="First Name"
                                type="text"
                                autoComplete="first_name"
                                required
                            />

                            {errors.first_name && (
                                <div className="text-danger mt-1">{errors.first_name}</div>
                            )}
                        </div>

                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <FormInput
                                id="last_name"
                                name="last_name"
                                label="Last Name"
                                type="text"
                                autoComplete="last_name"
                                required
                            />

                            {errors.last_name && (
                                <div className="text-danger mt-1">{errors.last_name}</div>
                            )}
                        </div>

                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <FormInput
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                autoComplete="email"
                                required
                            />

                            {errors.email && (
                                <div className="text-danger mt-1">{errors.email}</div>
                            )}
                        </div>

                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <FormInput
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                autoComplete="current-password"
                                required
                            />

                            {errors.password && (
                                <div className="text-danger mt-1">{errors.password}</div>
                            )}
                        </div>

                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <FormInput
                                id="password_confirmation"
                                name="password_confirmation"
                                label="Repeat Password"
                                type="password"
                                autoComplete="new-password"
                                required
                            />
                            {errors.password_confirmation && (
                                <div className="text-danger mt-1">{errors.password_confirmation}</div>
                            )}
                        </div>
                    </div>

                    <RememberForgotRow />

                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                            <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                                <button
                                    type="submit"
                                    className="_social_registration_form_btn_link _btn1"
                                    disabled={processing}
                                >
                                    {processing ? "Registering..." : "Regsiter"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}