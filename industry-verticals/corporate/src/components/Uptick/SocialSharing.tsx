import { useI18n } from 'next-localization';

export interface SocialSharingProps {
  articleUrl: string;
  contentType: string;
}

export const SocialSharing = (props: SocialSharingProps): JSX.Element => {
  const { t } = useI18n();

  if (!props.articleUrl) return <></>;

  let shareThisText = `Share this ${props.contentType.toLocaleLowerCase()}`;
  shareThisText = t(shareThisText);

  return (
    <div className="component social-sharing">
      <div className="social-sharing-container">
        <p className="sharing-text">{shareThisText}</p>
        <ul className="social-links">
          <li>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${props.articleUrl}`}
              title="LinkedIn"
              target="_blank"
            >
              <span className="image-text-container">
                <img
                  src="https://www.globalpayments.com/-/media/project/global-payments/corporate/shared/social-logos/li-black.svg"
                  alt="LinkedIn"
                  width="24"
                  height="25"
                  title="LinkedIn"
                />
              </span>
            </a>
          </li>
          <li>
            <a
              href={`https://twitter.com/intent/tweet?text=${props.articleUrl}`}
              title="X (Twitter)"
              target="_blank"
            >
              <span className="image-text-container">
                <img
                  src="https://www.globalpayments.com/-/media/project/global-payments/corporate/shared/social-logos/x-black.svg"
                  alt="Logo for X social media network"
                />
              </span>
            </a>
          </li>
          <li>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${props.articleUrl}`}
              title="Facebook"
              target="_blank"
            >
              <span className="image-text-container">
                <img
                  src="https://www.globalpayments.com/-/media/project/global-payments/corporate/shared/social-logos/fb-black.svg"
                  alt="Facebook"
                  width="24"
                  height="25"
                  title="Facebook"
                />
              </span>
            </a>
          </li>

          {/* TODO: Work out _how_ to share with Youtube? */}
          {/* <li>
                        <a href="https://www.youtube.com/channel/UCg9HiItBheBjWJcOBE8q9HQ" title="YouTube" target="_blank" data-ea-zone="Footer" data-ea-type="click" data-ea-link="/industries/retail | YouTube" data-sc-goal="C907B6D1-C87D-41EC-A379-D7B1F9A48726">
                            <span className="image-text-container"><img src="https://www.globalpayments.com/-/media/project/global-payments/corporate/shared/social-logos/yt-black.svg" alt="YouTube" width="24" height="25" /></span>
                        </a>
                    </li> */}
        </ul>
      </div>
    </div>
  );
};
