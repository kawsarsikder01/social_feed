export default function LoginHero({ image, type }: { image?: string; type?: 'login' | 'register' }) {
  return (
    <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
      <div className={type === 'login' ? '_social_login_left' : '_social_registration_right'}>
        <div className={type === 'login' ? '_social_login_left_image' : '_social_registration_right_image'}>
          <img
            src={image || "/assets/images/login.png"}
            alt="Image"
            className={type === 'login' ?"_left_img":''}
          />
        </div>
        {type === 'register' && (
          <div className="_social_registration_right_image_dark">
            <img src="/assets/images/registration1.png" alt="Image" />
          </div>
        )}
      </div>
    </div>
  );
}