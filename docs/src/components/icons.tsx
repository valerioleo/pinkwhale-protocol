export type TokenKind = 'usdc' | 'bayc' | 'pudgy' | 'apecoin' | 'pinkwhale';

const TOKEN_IMAGES: Record<Exclude<TokenKind, 'pinkwhale'>, {src: string; alt: string}> = {
  usdc: {src: '/tokens/usdc.png', alt: 'USDC'},
  bayc: {src: '/tokens/bayc.png', alt: 'Bored Ape Yacht Club'},
  pudgy: {src: '/tokens/pudgy.png', alt: 'Pudgy Penguins'},
  apecoin: {src: '/tokens/apecoin.png', alt: 'ApeCoin'}
};

/** The Pinkwhale mark, inlined so it takes the surrounding text colour. */
export const PinkwhaleMark = () => (
  <svg viewBox="0 0 28 24" fill="none" aria-hidden="true" className="pw-icon pw-icon--mark">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M27.1706 6.36452C26.4095 2.89934 23.3649 0.425636 19.8397 0.165247C16.8853 -0.0550824 14.2814 -0.0550824 11.4171 0.165247C7.80167 0.425636 4.66698 2.99949 4.06608 6.59486C3.51526 9.86976 3.51526 12.9644 4.16623 16.8202V16.8502C4.15622 17.2408 4.01601 17.5412 3.60539 17.9218C3.32497 18.0219 3.18476 18.0019 2.92437 17.9218C2.50374 17.6814 2.43364 17.4912 2.33349 17.2007C2.30344 17.1306 2.28341 17.0605 2.24336 16.9804L2.08312 16.2493C2.56383 15.9689 2.85427 15.8287 3.43514 15.6684V15.2478C2.90434 15.3379 2.60389 15.3279 2.08312 15.2478L1.82273 15.6684H1.51226L1.41211 15.2478C0.851273 15.3379 0.540809 15.3279 0 15.2478V15.6684C0.671004 15.7786 0.991483 15.9088 1.51226 16.2493L1.46219 16.9804C1.46219 16.9804 1.41211 17.5012 1.51226 18.3424C1.61241 19.1837 2.22333 19.9649 3.0746 20.8061C5.42812 22.6088 7.35099 23.0495 10.4657 23.3699C10.8162 23.4501 11.1767 23.5001 11.5473 23.5302C14.5317 23.7605 17.1857 23.7505 20.1802 23.4801C23.5252 23.1797 26.4496 20.8762 27.2207 17.5913C28.072 13.9559 28.102 10.6309 27.1706 6.37453V6.36452ZM19.4691 14.6769C19.4691 13.7656 20.4606 13.0245 21.6824 13.0245C22.9043 13.0245 23.8957 13.7656 23.8957 14.6769C23.8957 15.5883 22.9043 16.3294 21.6824 16.3294C20.4606 16.3294 19.4691 15.5883 19.4691 14.6769Z"
      fill="currentColor"
    />
  </svg>
);

export const TokenIcon = ({kind}: {kind: TokenKind}) => {
  if (kind === 'pinkwhale') return <PinkwhaleMark />;

  const {src, alt} = TOKEN_IMAGES[kind];

  return <img className="pw-icon" src={src} alt={alt} width={20} height={20} loading="lazy" />;
};
