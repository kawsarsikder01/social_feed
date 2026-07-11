interface GoogleSignInButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export default function GoogleSignInButton({
  onClick,
  label = "Or sign-in with google",
  className = "",
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      className={className || "_social_login_content_btn _mar_b40"}
      onClick={onClick}
    >
      <img
        src="/assets/images/google.svg"
        alt="Google"
        className="_google_img"
      />
      <span>{label}</span>
    </button>
  );
}