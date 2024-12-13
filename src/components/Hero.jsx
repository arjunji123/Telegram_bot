import React, { useEffect } from 'react';
import '../styles/hero.css';

const HeroSection = () => {

  // Optional: Use useEffect to control the start of animations or make them dynamic
  useEffect(() => {
    const images = document.querySelectorAll('.hero-images-wrapper img');
    images.forEach((img, index) => {
      img.style.animation = `coinAnimation railAnimationReverse ${3 + index * 0.7}s infinite ease-in-out`;
    });
  }, []);

  return (
    <div className="section">
            <div className="w-layout-grid hero-grid-header">

            <div id="w-node-_3a0f5fec-828a-eafa-5dce-f5c5693cd89f-990d43df" className="wrap-container">
          <div className="w-layout-grid main-grid">
            <div id="w-node-ca850897-97af-cccd-0876-e55de8024ec1-990d43df" className="wrapper-container inner-padding-small">
              <div className="container header w-container">
                <h1 className="heading-xlarge _16-ch">All Crypto — One App</h1>
                <div className="hero-cta-wrapper margin-bottom-xsmall">
                  <a href="https://t.me/UnitedCryptoBot" target="_blank" className="button bg-white ">
                    Launch United on Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="w-node-b3fdc0c4-7162-b493-f01a-ac52dffe4cd2-990d43df" className="hero-images-wrapper">
        <div className="hero-rail">
        <div className="rail-wrapper-reverse" >
            <div className="w-layout-grid grid-rail">
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c718479f8f780295b53d_Group%2048097940.png"
                  loading="lazy"
                  alt="Arbitrum Coin Logo"
                  className="image-tiles-hero _3d"
                />
              </div>
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c722acecf90e748d203c_Group%2048097941.png"
                  loading="lazy"
                  alt="Lido DAO Coin Logo"
                  className="image-tiles-hero _3d-reverse"
                />
              </div>
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c72e245ce6b52a674071_Group%2048097942.png"
                  loading="lazy"
                  alt="Doge Coin Logo"
                  className="image-tiles-hero _3d-flip"
                />
              </div>
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c737c28cd4c1943182e3_Group%2048097943.png"
                  loading="lazy"
                  alt="Worldcoin Logo"
                  className="image-tiles-hero _3d-reverse"
                />
              </div>
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c7427966128030d73351_Group%2048097944.png"
                  loading="lazy"
                  alt="Bitcoin Cash Logo"
                  className="image-tiles-hero _3d-reverse"
                />
              </div>
            </div>
          </div>
        <div className="rail-wrapper-reverse" >
            <div className="w-layout-grid grid-rail">
              <div className="frame-image-overflow no-frame">
              <img src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c752d9243a672e7ae2af_Group%2048097945.png" loading="lazy" alt="Ethereum Logo" className="image-tiles-hero _3d" />
              </div>
              <div className="frame-image-overflow no-frame">
              <img src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c75ebcfbf52a0232dba2_Group%2048097946.png" loading="lazy" alt="Bitcoin Logo"   className="image-tiles-hero _3d-reverse" />
              </div>
              <div className="frame-image-overflow no-frame">
              <img src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c76a30193b184e905db1_Group%2048097947.png" loading="lazy" alt="Maker Coin Logo"   className="image-tiles-hero _3d-reverse" />
              </div>
              <div className="frame-image-overflow no-frame">
              <img src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c7774a2aa2f1f65e2ab7_Group%2048097948.png" loading="lazy" alt="Link Coin Logo"   className="image-tiles-hero _3d-reverse" />
              </div>
              <div className="frame-image-overflow no-frame">
              <img src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c7861d96ccbda836871a_Group%2048097949.png" loading="lazy" alt="Celestia Coin Logo"   className="image-tiles-hero _3d-reverse"
              />
              </div>
            </div>
          </div>
        </div>
        <div className="hero-rail">
          <div className="rail-wrapper">
            <div className="w-layout-grid grid-rail">
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c7995525915bb00b19cf_Group%2048097950.png"
                  loading="lazy"
                  alt="Atom Coin Logo"
                  className="image-tiles-hero _3d-reverse"
                />
              </div>
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c7a4069a126f845e3b9d_Group%2048097951.png"
                  loading="lazy"
                  alt="Tron Coin Logo"
                  className="image-tiles-hero _3d"
                />
              </div>
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c7b11d96ccbda83698e3_Group%2048097952.png"
                  loading="lazy"
                  alt="Shitcoin Logo"
                  className="image-tiles-hero _3d-flip"
                />
              </div>
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c7be0a4536d4fcf62072_Group%2048097953.png"
                  loading="lazy"
                  alt="Sei Coin Logo"
                  className="image-tiles-hero"
                />
              </div>
              <div className="frame-image-overflow no-frame">
                <img
                  src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6c7ca3061e1aff371d14b_Group%2048097954.png"
                  loading="lazy"
                  alt="Pepe Coin Logo"
                  className="image-tiles-hero _3d-reverse"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="w-node-d68f6320-2373-2433-0132-2ed5f3b9de3d-990d43df" className="device-wrapper">
        <div>
          <img
            src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6a7e38e9ad2df88db2e9a_blum-home-screen.png"
            loading="lazy"
            srcSet="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6a7e38e9ad2df88db2e9a_blum-home-screen-p-500.png 500w, https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6a7e38e9ad2df88db2e9a_blum-home-screen-p-800.png 800w, https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6a7e38e9ad2df88db2e9a_blum-home-screen-p-1080.png 1080w, https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6a7e38e9ad2df88db2e9a_blum-home-screen.png 1440w"
            alt="United's Home Screen"
            sizes="(max-width: 479px) 45vw, (max-width: 767px) 50vw, 30vw"
            className="image-iphone"
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default HeroSection;
