import React from 'react';

function Header() {
  return (
    <div className='wrappernav '>
       <div
      data-collapse="medium"
      data-animation="default"
      data-duration="400"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="navbar w-nav"
    >
      <div className="w-layout-grid navgrid">
        <a
          href="/?r=0"
          id="w-node-b2052354-5446-da9c-e906-f9d98118b8b1-8118b8ae"
          aria-current="page"
          className="w-nav-brand w--current"
        >
          <img
   src="\image\U.png"            loading="lazy"
            alt="United logo"
            className="image-brand"
          />
        </a>
        <nav
          role="navigation"
          id="w-node-b2052354-5446-da9c-e906-f9d98118b8b3-8118b8ae"
          className="nav-menu w-nav-menu"
        >
          <a href="/blog" className="link-icons center nav-link w-inline-block">
            <div className="text-block-2">Blog</div>
          </a>
          <a
            href="http://T.me/Unitedcrypto"
            target="_blank"
            rel="noopener noreferrer"
            className="link-icons center w-inline-block"
          >
            <img
              src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65db645afc4f675bc370f70d_telegram.svg"
              loading="lazy"
              alt=""
              className="icon-social"
            />
          </a>
          <a
            href="https://discord.gg/Unitedcrypto"
            target="_blank"
            rel="noopener noreferrer"
            className="link-icons center w-inline-block"
          >
            <img
              src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65e205147ec1a92c10f26b6d_discord-mark-white.svg"
              loading="lazy"
              alt=""
              className="icon-social"
            />
          </a>
          <a
            href="http://x.com/Unitedcrypto"
            target="_blank"
            rel="noopener noreferrer"
            className="link-icons center w-inline-block"
          >
            <img
              src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6a1a4a0e2af577bcccf87_ic-twitter-white.svg"
              loading="lazy"
              width="22"
              alt="Twitter"
              className="icon-social"
            />
          </a>
          <div className="buttons-nav-wrapper">
            <div className="w-layout-grid grid-buttons">
              <div></div>
            </div>
          </div>
        </nav>
        <div
          id="w-node-b2052354-5446-da9c-e906-f9d98118b8c9-8118b8ae"
          data-w-id="b2052354-5446-da9c-e906-f9d98118b8c9"
          className="menu-button w-nav-button"
          style={{ WebkitUserSelect: 'text' }}
          aria-label="menu"
          role="button"
          tabIndex="0"
          aria-controls="w-nav-overlay-0"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <div className="menu-mobile">
            <div
              data-w-id="95a6b465-b1f6-32c9-f1ca-4e8c429efe2f"
              data-is-ix2-target="1"
              data-animation-type="lottie"
              data-src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b6a1a4a0e2af577bcccf95_lf30_editor_0dtgjm93.json"
              data-loop="0"
              data-direction="1"
              data-autoplay="0"
              data-renderer="svg"
              data-default-duration="1.5015014403440954"
              data-duration="0"
              data-ix2-initial-state="25"
            >
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 201 99"
                width="201"
                height="99"
                preserveAspectRatio="xMidYMid meet"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: 'translate3d(0px, 0px, 0px)',
                  contentVisibility: 'visible',
                }}
              >
                <defs>
                  <clipPath id="__lottie_element_2">
                    <rect width="201" height="99" x="0" y="0"></rect>
                  </clipPath>
                </defs>
                <g clipPath="url(#__lottie_element_2)">
                  <g
                    transform="matrix(1,0,0,1,230.6140594482422,167.4790496826172)"
                    opacity="1"
                    style={{ display: 'block' }}
                  >
                    <g
                      opacity="1"
                      transform="matrix(1,0,0,1,-119.20700073242188,-102.84600067138672)"
                    >
                      <path
                        fill="rgb(255,255,255)"
                        fillOpacity="1"
                        d="M53.5,-3 C53.5,-3 53.5,3 53.5,3 C53.5,3 -53.5,3 -53.5,3 C-53.5,3 -53.5,-3 -53.5,-3 C-53.5,-3 53.5,-3 53.5,-3z"
                      ></path>
                    </g>
                  </g>
                  <g
                    transform="matrix(1,0,0,1,205.1953887939453,167.3459930419922)"
                    opacity="1"
                    style={{ display: 'block' }}
                  >
                    <g
                      opacity="1"
                      transform="matrix(1,0,0,1,-119.70700073242188,-132.8459930419922)"
                    >
                      <path
                        fill="rgb(255,255,255)"
                        fillOpacity="1"
                        d="M53.5,-3 C53.5,-3 53.5,3 53.5,3 C53.5,3 -53.5,3 -53.5,3 C-53.5,3 -53.5,-3 -53.5,-3 C-53.5,-3 53.5,-3 53.5,-3z"
                      ></path>
                    </g>
                  </g>
                </g>
              </svg> */}
            </div>
          </div>
        </div>
      </div>
      <div className="w-nav-overlay" data-wf-ignore="" id="w-nav-overlay-0"></div>
    </div>
    </div>
  )
}

export default Header