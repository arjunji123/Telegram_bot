const CryptoJourneySection = () => {
  return (
    <section className="section">
      <div className="container padding-top-large w-container">
        <div className="bg-blue rounded">
          <div className="w-layout-grid main-grid no-gap">
            <div id="w-node-_62144753-0e03-d805-2a1b-f1ea318be914-990d43df" className="inner-image-cta">
              <img
                src="https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b70852a0e2af577b00d1b8_trading-half.png"
                loading="lazy"
                sizes="(max-width: 479px) 61vw, (max-width: 767px) 65vw, 66vw"
                srcSet="
                  https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b70852a0e2af577b00d1b8_trading-half-p-500.png 500w,
                  https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65b70852a0e2af577b00d1b8_trading-half.png 800w
                "
                alt="markets screen"
                className="full-image cta"
              />
            </div>
            {/* Call-to-Action Section */}
            <div
              id="w-node-_62144753-0e03-d805-2a1b-f1ea318be916-990d43df"
              className="wrapper-call-to-action inner-padding-small"
              style={{
                transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
                transformStyle: 'preserve-3d',
                opacity: 1,
              }}
            >
              <h3 className="heading-medium margin-bottom-xsmall">
                Start your crypto journey with United today
              </h3>
              <div className="form-wrapper left">
                <a
                  href="https://t.me/UnitedCryptoBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button bg-white w-button"
                >
                  Launch United on Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CryptoJourneySection;
