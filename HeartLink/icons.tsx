import { React } from "@webpack/common";

export interface IconProps {
    className?: string;
    style?: React.CSSProperties;
    size?: number;
    color?: string;
    color2?: string;
    color3?: string;
}

export function HeartLinkLogoIcon({ size = 20, className, style }: IconProps) {
    return (
        <svg
            className={className}
            viewBox="0 0 36 36"
            width={size}
            height={size}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
        >
            <path d="M12.8 7.2C10.2 4.8 6.2 4.8 3.7 7.3C1.2 9.8 1.2 13.8 3.7 16.3L12.8 25.4L15.2 23L6.1 13.9C4.9 12.7 4.9 10.9 6.1 9.7C7.3 8.5 9.1 8.5 10.3 9.7L12.8 12.2L15.3 9.7C16.5 8.5 18.3 8.5 19.5 9.7C20.7 10.9 20.7 12.7 19.5 13.9L18.4 15L20.8 17.4L21.9 16.3C24.4 13.8 24.4 9.8 21.9 7.3C19.4 4.8 15.4 4.8 12.8 7.2Z" fill="#5865F2"/>
            <path d="M23.2 28.8C25.8 31.2 29.8 31.2 32.3 28.7C34.8 26.2 34.8 22.2 32.3 19.7L23.2 10.6L20.8 13L29.9 22.1C31.1 23.3 31.1 25.1 29.9 26.3C28.7 27.5 26.9 27.5 25.7 26.3L23.2 23.8L20.7 26.3C19.5 27.5 17.7 27.5 16.5 26.3C15.3 25.1 15.3 23.3 16.5 22.1L17.6 21L15.2 18.6L14.1 19.7C11.6 22.2 11.6 26.2 14.1 28.7C16.6 31.2 20.6 31.2 23.2 28.8Z" fill="#EB459E"/>
            <circle cx="18" cy="18" r="2.5" fill="#FFFFFF"/>
        </svg>
    );
}

export function Icon({
    path,
    className,
    style,
    size = 16,
    color,
    color2,
    color3,
}: IconProps & { path: string; }) {
    const isMultiColor = Boolean((color2 && color2 !== color) || (color3 && color3 !== color));
    const gradId = `hl-grad-${(color || "").replace("#", "")}-${(color2 || "").replace("#", "")}-${(color3 || "").replace("#", "")}`;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width={size}
            height={size}
            className={className}
            style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
            aria-hidden="true"
        >
            {isMultiColor && (
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color ?? "#ffffff"} />
                        <stop offset="50%" stopColor={color2 ?? color ?? "#ffffff"} />
                        <stop offset="100%" stopColor={color3 ?? color2 ?? color ?? "#ffffff"} />
                    </linearGradient>
                </defs>
            )}
            <path
                d={path}
                fill={isMultiColor ? `url(#${gradId})` : (color ?? "currentColor")}
            />
        </svg>
    );
}

// fa-heart (Romantic / Love)
export const HeartIcon = (p: IconProps) => <Icon {...p} path="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />;

// fa-gem (Diamond / Precious)
export const GemIcon = (p: IconProps) => <Icon {...p} path="M112.8 0c-13-1.1-26 4.9-33.5 16.2L4.6 128c-6.1 9.2-6.1 21.1 0 30.3l236.8 338.4c7.3 10.4 19.3 16.6 32 16.6s24.7-6.2 32-16.6L542.2 158.3c6.1-9.2 6.1-21.1 0-30.3L467.5 16.2C460 4.9 447-1.1 434 0L112.8 0z" />;

// fa-crown (Royalty / Crown)
export const CrownIcon = (p: IconProps) => <Icon {...p} path="M256 0c14.1 0 26.6 9.3 30.6 22.8L330.1 170.9l119-95.2c11.9-9.5 28.9-8.4 39.5 2.6s12.5 27.8 4.4 40.4L400 256v192c0 35.3-28.7 64-64 64H176c-35.3 0-64-28.7-64-64V256L19 118.7c-8.1-12.6-6.2-29.4 4.4-40.4s27.6-12.1 39.5-2.6l119 95.2 43.5-148.1C229.4 9.3 241.9 0 256 0z" />;

// fa-star (Star / Best Friend)
export const StarIcon = (p: IconProps) => <Icon {...p} path="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />;

// fa-handshake (Friend / Companion)
export const HandshakeIcon = (p: IconProps) => <Icon {...p} path="M323.4 85.2l-96.8 78.4c-16.1 13-19.2 36.4-7 53.1c12.9 17.8 38 21.3 55.3 7.8l99.3-77.2c7-5.4 17-4.2 22.5 2.8s4.2 17-2.8 22.5l-20.9 16.2L550.2 352H592c26.5 0 48-21.5 48-48V176c0-26.5-21.5-48-48-48H516.3L480 94c-18.3-19.5-44.1-30-70.7-30h-4.8c-35.3 0-68.5 15.3-91.1 42.2zm-88 52.1l-96.8-78.4C115.5 31.3 82.3 16 47 16H42.2C18.9 16 .2 34.7 0 58v3.5c0 23.4 18.7 42.5 42.2 42.5H72.8L72 232H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H72c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16H200l-8-160h.4zM240 176c-8.8 0-16 7.2-16 16s7.2 16 16 16h16c8.8 0 16-7.2 16-16s-7.2-16-16-16H240z" />;

// fa-wand-magic-sparkles (Magic / Sparkles)
export const WandSparklesIcon = (p: IconProps) => <Icon {...p} path="M288 0c17.7 0 32 14.3 32 32V64h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H320v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V128H224c-17.7 0-32-14.3-32-32s14.3-32 32-32h32V32c0-17.7 14.3-32 32-32zM96 128c17.7 0 32 14.3 32 32v16h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H128v16c0 17.7-14.3 32-32 32s-32-14.3-32-32V240H48c-17.7 0-32-14.3-32-32s14.3-32 32-32H64V160c0-17.7 14.3-32 32-32zm264.4 97.4c12.5-12.5 32.8-12.5 45.3 0l90.5 90.5c12.5 12.5 12.5 32.8 0 45.3L224 533.5c-12.5 12.5-32.8 12.5-45.3 0L88.2 443c-12.5-12.5-12.5-32.8 0-45.3L360.4 225.4z" />;
export const SparklesIcon = WandSparklesIcon;

// fa-fire (Fire / Passion)
export const FireIcon = (p: IconProps) => <Icon {...p} path="M159.3 5.4c7.8-7.3 19.9-7.2 27.7 .1c27.6 26 91.1 91 111.6 136C320 188 320 236 320 236c0 10.9-5.5 21-14.7 26.9s-20.9 6.6-30.8 1.9L242.9 250c-5.8-2.8-12.7-2.3-18 1.3s-8.1 9.7-7.4 16c6.2 55.6-7.8 111.7-41 155.7C159.3 445.6 139.7 464 120 480c-55.8 45.4-120 32-120-40c0-44.2 19.8-85.7 54.1-113.6C89.1 300.7 112 258.9 112 214c0-36.8-15.6-71.4-42.9-95.7c-9.2-8.2-11.8-21.7-6.4-32.8s17.5-17.7 29.8-15.9c25.4 3.7 51.5-.9 74.3-13.4c2.8-1.5 5.5-3.3 8.1-5.2c1.7-1.3 3.4-2.7 5.1-4.1c-4.8-14.5-9.7-29.2-14.6-43.5c-3.1-9.2 1.4-19.3 9.9-24z" />;

// fa-infinity (Forever & Always)
export const InfinityIcon = (p: IconProps) => <Icon {...p} path="M0 256a128 128 0 0 1 218.5-90.5L256 203l37.5-37.5A128 128 0 1 1 474.5 346.5L256 128 37.5 346.5A127.6 127.6 0 0 1 0 256z" />;

// fa-gamepad (Gaming)
export const GamepadIcon = (p: IconProps) => <Icon {...p} path="M512 176c0-44.2-35.8-80-80-80H80c-44.2 0-80 35.8-80 80v160c0 44.2 35.8 80 80 80h352c44.2 0 80-35.8 80-80V176zM176 288h-32v32c0 8.8-7.2 16-16 16s-16-7.2-16-16v-32H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h32v-32c0-8.8 7.2-16 16-16s16 7.2 16 16v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16zm208-48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm48-48a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />;

// fa-moon (Night / Celestial)
export const MoonIcon = (p: IconProps) => <Icon {...p} path="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.9-19-.9z" />;

// fa-bolt (Energy / Electric)
export const BoltIcon = (p: IconProps) => <Icon {...p} path="M0 256C0 114.6 114.6 0 256 0S512 114.6 512 256s-114.6 256-256 256S0 397.4 0 256zM241 377l120-144c5.8-7 6.6-16.9 2.1-24.7s-12.7-12.3-21.6-12.3l-73.5 0 20.3-81.1c2.4-9.6-1.5-19.7-9.7-25s-18.9-5-26.6 .7l-120 144c-5.8 7-6.6 16.9-2.1 24.7s12.7 12.3 21.6 12.3l73.5 0-20.3 81.1c-2.4 9.6 1.5 19.7 9.7 25s18.9 5 26.6-.7z" />;

// fa-paw (Pets / Cute)
export const PawIcon = (p: IconProps) => <Icon {...p} path="M256 224c-79.5 0-144 64.5-144 144s64.5 144 144 144 144-64.5 144-144-64.5-144-144-144zm-144-80c0 35.3-28.7 64-64 64s-64-28.7-64-64 28.7-64 64-64 64 28.7 64 64zm304 0c0 35.3-28.7 64-64 64s-64-28.7-64-64 28.7-64 64-64 64 28.7 64 64zM160 48c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zm192 0c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z" />;

// fa-ghost (Ghost / Spooky)
export const GhostIcon = (p: IconProps) => <Icon {...p} path="M256 0C114.6 0 0 114.6 0 256v192c0 26.5 21.5 48 48 48h32c17.7 0 32-14.3 32-32v-16c0-8.8 7.2-16 16-16s16 7.2 16 16v16c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32v-16c0-8.8 7.2-16 16-16s16 7.2 16 16v16c0 17.7 14.3 32 32 32h32c26.5 0 48-21.5 48-48V256C512 114.6 397.4 0 256 0zM160 176a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm192 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />;

// fa-music (Music / Melody)
export const MusicIcon = (p: IconProps) => <Icon {...p} path="M499.7 18.6c11 8.2 16.3 22.2 13.2 35.6L448 336.8c-1.3 5.7-3.9 11-7.7 15.3L371.4 430.7c-17.7 19.8-43.1 31.3-69.8 31.3c-50.6 0-91.6-41-91.6-91.6c0-50.6 41-91.6 91.6-91.6c14.2 0 27.8 3.3 39.9 9.1L384 167.3V64c0-14.7 10-27.5 24.3-31.1l80-20c11.1-2.8 22.8 1.5 31.4 5.7z" />;

// fa-ring (Wedding Ring)
export const RingIcon = (p: IconProps) => <Icon {...p} path="M256 0c70.7 0 128 57.3 128 128c0 43.1-21.3 81.3-54 104.8l20.4 122.6c3.1 18.5-9.3 35.8-27.8 38.9s-35.8-9.3-38.9-27.8L270.8 288H241.2l-12.9 78.5c-3.1 18.5-20.4 30.9-38.9 27.8s-27.8-20.4-24.7-38.9L185 232.8C152.3 209.3 131 171.1 131 128C131 57.3 188.3 0 256 0z" />;

// fa-pen / pencil
export const PencilIcon = (p: IconProps) => <Icon {...p} path="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.6 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.6 410.3 231z" />;

// fa-check
export const CheckIcon = (p: IconProps) => <Icon {...p} path="M438.6 105.4c12.5-12.5 12.5-32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />;

// fa-arrow-left
export const ArrowLeftIcon = (p: IconProps) => <Icon {...p} path="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />;

// fa-upload
export const UploadIcon = (p: IconProps) => <Icon {...p} path="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l64 0 0 192c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-192 64 0c13 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128zM32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 448z" />;

// fa-clock
export const ClockIcon = (p: IconProps) => <Icon {...p} path="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.5 33.3-6.5s4.5-25.9-6.5-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />;

// fa-xmark
export const XMarkIcon = (p: IconProps) => <Icon {...p} path="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />;

// fa-trash
export const TrashIcon = (p: IconProps) => <Icon {...p} path="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H384l-7.2-14.3C369.3 6.8 360.9 0 351 0H161c-9.9 0-18.3 6.8-25.8 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H381c25.3 0 46.3-19.7 47.9-45L416 128z" />;

// fa-envelope
export const EnvelopeIcon = (p: IconProps) => <Icon {...p} path="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />;

// fa-paper-plane
export const PaperPlaneIcon = (p: IconProps) => <Icon {...p} path="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />;

// fa-bell
export const BellIcon = (p: IconProps) => <Icon {...p} path="M224 0c-17.7 0-32 14.3-32 32V49.9C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-158.1V32c0-17.7-14.3-32-32-32zm45.3 464c-6.1 27.6-30.8 48-60 48s-53.9-20.4-60-48h120z" />;

// fa-bell-slash
export const BellSlashIcon = (p: IconProps) => <Icon {...p} path="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l464 368c10.4 8.3 25.5 6.4 33.7-4s6.4-25.5-4-33.7L416 305.6V208c0-77.4-55-142-128-158.1V32c0-17.7-14.3-32-32-32s-32 14.3-32 32v17.9c-29.1 6.5-54.7 22.4-74.1 44.8L38.8 5.1zM64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H344.8l-64-50.8-12-9.5c-4.9-3.9-8.8-8.7-11.5-14.2L224 308.2V208c0-5.8 .6-11.4 1.7-16.9L64.2 59.8C64.1 61.2 64 62.6 64 64V208zm145.3 256c-6.1 27.6-30.8 48-60 48s-53.9-20.4-60-48h120z" />;

// fa-magnifying-glass
export const SearchIcon = (p: IconProps) => <Icon {...p} path="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />;

// fa-plus
export const PlusIcon = (p: IconProps) => <Icon {...p} path="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />;

// fa-shield-heart
export const ShieldHeartIcon = (p: IconProps) => <Icon {...p} path="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.7 36.3 31.6 36.3 55.7 0 178.6-107.5 329.8-226.7 370.4-7.4 2.5-15.3 2.5-22.7 0C125.5 468.3 18 317.1 18 138.5c0-24.1 14.3-46 36.3-55.7L242.6 2.9C246.8 1 251.4 0 256 0z" />;

// fa-palette (Studio Style & Glow)
export const PaletteIcon = (p: IconProps) => <Icon {...p} path="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3H344c-26.5 0-48 21.5-48 48c0 3.5 .4 7 1.1 10.3c1.9 8.6 3 17.5 3 26.7c0 53-43 96-96 96H192C86 496 0 410 0 304C0 144.9 129 16 288 16c123.7 0 224 100.3 224 224c0 5.3-.2 10.7-.6 16zM160 256a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm-64-64a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm224-32a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm64 64a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />;

// fa-sliders (FX & Shader Sliders)
export const SlidersIcon = (p: IconProps) => <Icon {...p} path="M0 416c0-17.7 14.3-32 32-32l54.7 0c12.3-28.3 40.5-48 73.3-48s61 19.7 73.3 48L480 384c17.7 0 32 14.3 32 32s-14.3 32-32 32l-246.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 448c-17.7 0-32-14.3-32-32zm192 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM0 256c0-17.7 14.3-32 32-32l198.7 0c12.3-28.3 40.5-48 73.3-48s61 19.7 73.3 48L480 224c17.7 0 32 14.3 32 32s-14.3 32-32 32l-102.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 288c-17.7 0-32-14.3-32-32zm336 0a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM0 96C0 78.3 14.3 64 32 64l70.7 0c12.3-28.3 40.5-48 73.3-48s61 19.7 73.3 48L480 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-302.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 128C14.3 128 0 113.7 0 96zM176 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />;

// fa-film (Studio Animations)
export const FilmIcon = (p: IconProps) => <Icon {...p} path="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM48 368v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H416zM48 240v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H416zM48 112v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V112c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V112c0-8.8-7.2-16-16-16H416zM160 96V416H352V96H160z" />;

// fa-floppy-disk (Studio Presets)
export const FloppyDiskIcon = (p: IconProps) => <Icon {...p} path="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160H352c-17.7 0-32-14.3-32-32V0H64zM320 0v128h96L320 0zM128 256h256c17.7 0 32 14.3 32 32v128c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V288c0-17.7 14.3-32 32-32z" />;

// fa-circle-info (Studio Roles & Info)
export const InfoCircleIcon = (p: IconProps) => <Icon {...p} path="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144a24 24 0 1 1 0-48 24 24 0 1 1 0 48z" />;

// fa-calendar-days
export const CalendarDaysIcon = (p: IconProps) => <Icon {...p} path="M128 0c17.7 0 32 14.3 32 32V64H352V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H480V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm144 0c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336z" />;

// fa-rotate (3D Spin)
export const RotateIcon = (p: IconProps) => <Icon {...p} path="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 32-96 0C100.3 224 0 324.3 0 448c0 17.7 14.3 32 32 32s32-14.3 32-32c0-88.4 71.6-160 160-160l96 0 0 32c0 13 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64zM73.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-32 96 0c123.7 0 224-100.3 224-224c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 88.4-71.6 160-160 160l-96 0 0-32c0-13-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64z" />;

// fa-heart-pulse (Heartbeat Pulse)
export const HeartPulseIcon = (p: IconProps) => <Icon {...p} path="M256 0c14.1 0 26.6 9.3 30.6 22.8L316.9 128H448c35.3 0 64 28.7 64 64v5.8c0 41.5-17.2 81.2-47.6 109.5L283.7 476.4c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9L47.6 307.3C17.2 279 0 239.3 0 197.8V192c0-35.3 28.7-64 64-64H195.1l30.3-105.2C229.4 9.3 241.9 0 256 0zm-35.6 242.4L188 355.2c-4.4 15.3-19.9 24.8-35.4 21.6s-25.7-17.7-23.2-33.3L146.7 224H80c-8.8 0-16 7.2-16 16v5.8c0 24.2 10 47.3 27.7 63.8L256 463.7l164.3-154.1c17.7-16.5 27.7-39.6 27.7-63.8V240c0-8.8-7.2-16-16-16H365.3l17.3 119.5c2.5 15.6-7.7 30.1-23.2 33.3s-31-6.3-35.4-21.6L291.6 242.4 268 160l-47.6 82.4z" />;

// fa-water (Floating Wave)
export const WaveIcon = (p: IconProps) => <Icon {...p} path="M0 224C0 206.3 14.3 192 32 192c28.3 0 54.3 11.5 73.4 30.6C124.5 241.7 150.5 256 178.8 256s54.3-14.3 73.4-33.4C271.3 203.5 297.3 192 325.6 192s54.3 11.5 73.4 30.6C418.1 241.7 444.1 256 472.4 256c22.1 0 40 17.9 40 40s-17.9 40-40 40c-28.3 0-54.3-11.5-73.4-30.6C379.9 286.3 353.9 272 325.6 272s-54.3 14.3-73.4 33.4C233.1 324.5 207.1 336 178.8 336s-54.3-11.5-73.4-30.6C86.3 286.3 60.3 272 32 272c-17.7 0-32-14.3-32-32zm0 128c0-17.7 14.3-32 32-32c28.3 0 54.3 11.5 73.4 30.6C124.5 369.7 150.5 384 178.8 384s54.3-14.3 73.4-33.4C271.3 331.5 297.3 320 325.6 320s54.3 11.5 73.4 30.6C418.1 369.7 444.1 384 472.4 384c22.1 0 40 17.9 40 40s-17.9 40-40 40c-28.3 0-54.3-11.5-73.4-30.6C379.9 414.3 353.9 400 325.6 400s-54.3 14.3-73.4 33.4C233.1 452.5 207.1 464 178.8 464s-54.3-11.5-73.4-30.6C86.3 414.3 60.3 400 32 400c-17.7 0-32-14.3-32-32z" />;

// fa-pause (Static clean)
export const PauseIcon = (p: IconProps) => <Icon {...p} path="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />;

// fa-snowflake (Diamond Frost)
export const SnowflakeIcon = (p: IconProps) => <Icon {...p} path="M256 0c13.3 0 24 10.7 24 24V90.7l35.3-35.3c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L313.4 125l59.6-34.4c11.5-6.6 26.2-2.7 32.8 8.8s2.7 26.2-8.8 32.8L337.4 166.7l64.3 0c13.3 0 24 10.7 24 24s-10.7 24-24 24H337.4l59.6 34.4c11.5 6.6 15.5 21.3 8.8 32.8s-21.3 15.5-32.8 8.8L313.4 256l35.8 35.8c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L280 290.4V357.3c0 13.3-10.7 24-24 24s-24-10.7-24-24V290.4l-35.3 35.3c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L198.6 256l-59.6 34.4c-11.5 6.6-26.2 2.7-32.8-8.8s-2.7-26.2 8.8-32.8L174.6 214.7H110.3c-13.3 0-24-10.7-24-24s10.7-24 24-24h64.3l-59.6-34.4c-11.5-6.6-15.5-21.3-8.8-32.8s21.3-15.5 32.8-8.8L198.6 125l-35.8-35.8c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L232 90.7V24c0-13.3 10.7-24 24-24z" />;

// fa-cube (Classic 3D)
export const CubeIcon = (p: IconProps) => <Icon {...p} path="M238.8 3.8C249.5-1.3 262.5-1.3 273.2 3.8l192 91.4c18.1 8.6 29.8 26.9 29.8 47V369.8c0 20.1-11.7 38.4-29.8 47l-192 91.4c-10.7 5.1-23.7 5.1-34.4 0l-192-91.4C27.7 408.2 16 389.9 16 369.8V142.2c0-20.1 11.7-38.4 29.8-47l192-91.4zM256 49.3L89.4 128.6 256 208l166.6-79.4L256 49.3zM64 175.7V360.8l160 76.2V251.9L64 175.7zm224 261.3l160-76.2V175.7l-160 76.2v185.1z" />;

// fa-flask (Toxic Acid)
export const FlaskIcon = (p: IconProps) => <Icon {...p} path="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V128c0 10.9-4.3 21.4-12 29.1L49 320.1C17.5 351.6 0 394.4 0 439C0 479.3 32.7 512 73 512H439c40.3 0 73-32.7 73-73c0-44.6-17.5-87.4-49-118.9L300 157.1c-7.7-7.7-12-18.2-12-29.1V32zM224 160V64h64v96c0 27.8 11 54.5 30.7 74.2L423 338.5c19.3 19.3 30.1 45.4 30.1 72.5c0 7.2-5.8 13-13 13H71c-7.2 0-13-5.8-13-13c0-27.1 10.8-53.2 30.1-72.5L193.3 234.2c19.7-19.7 30.7-46.4 30.7-74.2z" />;

// fa-droplet (Vampire Crimson)
export const DropletIcon = (p: IconProps) => <Icon {...p} path="M0 352C0 246 160 48 244.7 6.4c7.1-3.5 15.5-3.5 22.6 0C352 48 512 246 512 352c0 141.4-114.6 256-256 256S0 493.4 0 352z" />;

// fa-lightbulb (Neon Reactor)
export const LightbulbIcon = (p: IconProps) => <Icon {...p} path="M256 0C141.1 0 48 93.1 48 208c0 58.7 24.3 111.8 63.3 149.3c15.2 14.6 24.7 34.6 26.3 56.1l4.4 60.6H370l4.4-60.6c1.6-21.5 11.1-41.5 26.3-56.1C439.7 319.8 464 266.7 464 208c0-114.9-93.1-208-208-208zm-96 464h192v16c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32v-16z" />;

// fa-feather (Floating Bob)
export const FeatherIcon = (p: IconProps) => <Icon {...p} path="M512 0c-44.2 0-80 35.8-80 80v32c0 17.7-14.3 32-32 32H352c-17.7 0-32 14.3-32 32v48c0 17.7-14.3 32-32 32H240c-17.7 0-32 14.3-32 32v48c0 17.7-14.3 32-32 32H128c-17.7 0-32 14.3-32 32v48c0 17.7-14.3 32-32 32H32c-17.7 0-32 14.3-32 32v16c0 17.7 14.3 32 32 32h16c17.7 0 32-14.3 32-32v-16c0-17.7 14.3-32 32-32h32c17.7 0 32-14.3 32-32v-48c0-17.7 14.3-32 32-32h48c17.7 0 32-14.3 32-32v-48c0-17.7 14.3-32 32-32h48c17.7 0 32-14.3 32-32v-48c0-17.7 14.3-32 32-32h48c17.7 0 32-14.3 32-32V80c0-44.2 35.8-80 80-80z" />;

// fa-earth-americas (Orbital Flare)
export const GlobeIcon = (p: IconProps) => <Icon {...p} path="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM149.2 87.7c3.9-8.4 12.4-13.7 21.7-13.7h32c13.3 0 24 10.7 24 24v24c0 13.3-10.7 24-24 24h-16c-13.3 0-24 10.7-24 24v8c0 13.3 10.7 24 24 24h40c13.3 0 24-10.7 24-24v-8c0-13.3 10.7-24 24-24h8c13.3 0 24 10.7 24 24v16c0 13.3-10.7 24-24 24h-8c-13.3 0-24 10.7-24 24v40c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-8c0-13.3 10.7-24 24-24h16c13.3 0 24 10.7 24 24v32c0 8.8-4.9 16.9-12.7 20.9l-48 24.9c-8.9 4.6-19.6 4.3-28.2-.8L256 348.6l-37.1 27.8c-7.3 5.5-16.3 8.5-25.5 8.5h-16c-13.3 0-24-10.7-24-24v-40c0-13.3-10.7-24-24-24h-16c-13.3 0-24-10.7-24-24V216c0-13.3 10.7-24 24-24h16c13.3 0 24-10.7 24-24v-16c0-13.3-10.7-24-24-24h-8c-13.3 0-24-10.7-24-24v-8c0-13.3 10.7-24 24-24h16c13.3 0 24-10.7 24-24z" />;

// fa-terminal (Matrix Netrunner / Cyber Glitch)
export const TerminalIcon = (p: IconProps) => <Icon {...p} path="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L69.3 256 214.6 110.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160zm214.6 150.6c0-17.7 14.3-32 32-32l160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32z" />;

// fa-mobile-screen (Jitter Shake)
export const MobileIcon = (p: IconProps) => <Icon {...p} path="M80 0C44.7 0 16 28.7 16 64V448c0 35.3 28.7 64 64 64H304c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H80zm112 448a24 24 0 1 1 0-48 24 24 0 1 1 0 48z" />;

// fa-wind (Breathing / Air)
export const WindIcon = (p: IconProps) => <Icon {...p} path="M288 32c0-17.7 14.3-32 32-32c53 0 96 43 96 96s-43 96-96 96H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h288c17.7 0 32-14.3 32-32s-14.3-32-32-32c-17.7 0-32-14.3-32-32zM0 288c0-17.7 14.3-32 32-32h384c35.3 0 64 28.7 64 64s-28.7 64-64 64c-17.7 0-32-14.3-32-32s14.3-32 32-32c0 0 0 0 0 0H32c-17.7 0-32-14.3-32-32zm0 128c0-17.7 14.3-32 32-32h224c26.5 0 48 21.5 48 48s-21.5 48-48 48c-17.7 0-32-14.3-32-32s14.3-32 32-32c0 0 0 0 0 0H32c-17.7 0-32-14.3-32-32z" />;

// fa-basketball (Playful Bounce / Spring)
export const BasketballIcon = (p: IconProps) => <Icon {...p} path="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 461.3C136.2 447.8 64.2 375.8 50.7 280H160c11.9 67.2 44.8 126.7 91.5 171.1L232 461.3zM256 464c-53.7-48.4-90.4-114.9-102.3-190L358.3 274c-11.9 75.1-48.6 141.6-102.3 190zM352 280h109.3c-13.5 95.8-85.5 167.8-181.3 181.3l-19.5-9.8c46.7-44.4 79.6-103.9 91.5-171.1zM461.3 232H352c-11.9-67.2-44.8-126.7-91.5-171.1L280 50.7C375.8 64.2 447.8 136.2 461.3 232zM256 48c53.7 48.4 90.4 114.9 102.3 190L153.7 238c11.9-75.1 48.6-141.6 102.3-190zm-96 184H50.7C64.2 136.2 136.2 64.2 232 50.7l19.5 9.8C204.8 104.9 171.9 164.4 160 232z" />;

// fa-sun (Glow / Sunlight)
export const SunIcon = (p: IconProps) => <Icon {...p} path="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.8 256l62.3 90.5c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.8l-90.5 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.2 256 2.9 165.5c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.2 346.5 2.9c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 0 192 0 96 96 0 1 0 -192 0z" />;

export const ICON_OPTIONS: { id: string; label: string; IconComp: (p: IconProps) => React.ReactNode; defaultColor: string; }[] = [
    { id: "heart",      label: "Heart",      IconComp: HeartIcon,        defaultColor: "#f43f5e" },
    { id: "gem",        label: "Diamond",    IconComp: GemIcon,          defaultColor: "#f59e0b" },
    { id: "crown",      label: "Crown",      IconComp: CrownIcon,        defaultColor: "#eab308" },
    { id: "star",       label: "Star",       IconComp: StarIcon,         defaultColor: "#fbbf24" },
    { id: "ring",       label: "Ring",       IconComp: RingIcon,         defaultColor: "#f43f5e" },
    { id: "infinity",   label: "Infinity",   IconComp: InfinityIcon,     defaultColor: "#38bdf8" },
    { id: "sparkles",   label: "Sparkles",   IconComp: WandSparklesIcon, defaultColor: "#a855f7" },
    { id: "fire",       label: "Fire",       IconComp: FireIcon,         defaultColor: "#ef4444" },
    { id: "gamepad",    label: "Gaming",     IconComp: GamepadIcon,      defaultColor: "#10b981" },
    { id: "moon",       label: "Moon",       IconComp: MoonIcon,         defaultColor: "#facc15" },
    { id: "bolt",       label: "Lightning",  IconComp: BoltIcon,         defaultColor: "#f97316" },
    { id: "paw",        label: "Paw",        IconComp: PawIcon,          defaultColor: "#ec4899" },
    { id: "ghost",      label: "Ghost",      IconComp: GhostIcon,        defaultColor: "#e0e7ff" },
    { id: "music",      label: "Music",      IconComp: MusicIcon,        defaultColor: "#38bdf8" },
    { id: "handshake",  label: "Handshake",  IconComp: HandshakeIcon,    defaultColor: "#10b981" },
];

export const COLOR_OPTIONS = [
    "#f43f5e", // Rose Red
    "#38bdf8", // Sky Blue
    "#f59e0b", // Amber Gold
    "#10b981", // Emerald Green
    "#a855f7", // Violet Purple
    "#ef4444", // Crimson Flame
    "#ec4899", // Pink
    "#8b5cf6", // Indigo
];

/**
 * Enhanced Relationship Icon with Multi-Tone & Tri-Color Gradient Support
 */
export function RelationshipIcon({
    type,
    size = 18,
    customColor,
    style,
    className,
}: {
    type: string;
    size?: number;
    customColor?: string;
    style?: React.CSSProperties;
    className?: string;
}) {
    if (!type) return <HeartIcon size={size} color="#f43f5e" style={style} className={className} />;

    // Split customColor into 3 possible multi-tone colors: c1 (primary), c2 (secondary), c3 (accent)
    const colorParts = (customColor || "#ffffff").split(",");
    const c1 = colorParts[0] || "#ffffff";
    const c2 = colorParts[1] || c1;
    const c3 = colorParts[2] || c2;
    const iconProps = { size, color: c1, color2: c2, color3: c3, style, className };

    // 1. Direct Image URL (PNG, JPG, GIF, WebP, SVG, base64)
    if (type.startsWith("http://") || type.startsWith("https://") || type.startsWith("data:image/")) {
        return (
            <img
                src={type}
                alt="badge"
                className="hl-badge-img"
                loading="lazy"
                draggable={false}
                style={{
                    width: size,
                    height: size,
                    borderRadius: 3,
                    objectFit: "contain",
                    display: "inline-block",
                    verticalAlign: "middle",
                    filter: (c1 !== "#ffffff" && c1 !== c2) ? `drop-shadow(0 0 2px ${c1})` : undefined,
                    ...style,
                }}
            />
        );
    }

    // 2. Discord Custom Emoji syntax: <:name:id> or <a:name:id>
    const discordEmojiMatch = type.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);
    if (discordEmojiMatch) {
        const isAnimated = type.startsWith("<a:");
        const emojiId = discordEmojiMatch[2];
        const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? "gif" : "webp"}?size=48&quality=lossless`;
        return (
            <img
                src={emojiUrl}
                alt={discordEmojiMatch[1]}
                className="hl-badge-img"
                loading="lazy"
                draggable={false}
                style={{
                    width: size,
                    height: size,
                    borderRadius: 3,
                    objectFit: "contain",
                    display: "inline-block",
                    verticalAlign: "middle",
                    ...style,
                }}
            />
        );
    }

    // 3. Single / Multi Unicode Emoji string (e.g. 💍, 💖, 🎮, 🧸, 👑, 🌸, 🍓, 🦇)
    const isEmoji = /\p{Extended_Pictographic}/u.test(type);
    if (isEmoji && !type.includes("http")) {
        return (
            <span
                style={{
                    fontSize: `${size * 0.95}px`,
                    lineHeight: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    verticalAlign: "middle",
                    userSelect: "none",
                    ...style,
                }}
            >
                {type}
            </span>
        );
    }

    // 4. Standard SVG Presets with Dual-Tone / Tri-Color Gradient Support
    const safeType = typeof type === "string" ? type.toLowerCase() : "heart";
    switch (safeType) {
        case "girlfriend":
            return <HeartIcon {...iconProps} color={c1 ?? "#f43f5e"} />;
        case "boyfriend":
            return <HeartIcon {...iconProps} color={c1 ?? "#38bdf8"} />;
        case "wife":
            return <GemIcon {...iconProps} color={c1 ?? "#f59e0b"} />;
        case "husband":
            return <CrownIcon {...iconProps} color={c1 ?? "#eab308"} />;
        case "bestfriend":
            return <StarIcon {...iconProps} color={c1 ?? "#fbbf24"} />;
        case "ring":
            return <RingIcon {...iconProps} color={c1 ?? "#f43f5e"} />;
        case "infinity":
            return <InfinityIcon {...iconProps} color={c1 ?? "#38bdf8"} />;
        case "gamepad":
            return <GamepadIcon {...iconProps} color={c1 ?? "#10b981"} />;
        case "moon":
            return <MoonIcon {...iconProps} color={c1 ?? "#facc15"} />;
        case "bolt":
            return <BoltIcon {...iconProps} color={c1 ?? "#f97316"} />;
        case "paw":
            return <PawIcon {...iconProps} color={c1 ?? "#ec4899"} />;
        case "ghost":
            return <GhostIcon {...iconProps} color={c1 ?? "#e0e7ff"} />;
        case "music":
            return <MusicIcon {...iconProps} color={c1 ?? "#38bdf8"} />;
        case "friend":
        case "handshake":
            return <HandshakeIcon {...iconProps} color={c1 ?? "#10b981"} />;
        case "fire":
            return <FireIcon {...iconProps} color={c1 ?? "#ef4444"} />;
        case "gem":
            return <GemIcon {...iconProps} color={c1 ?? "#f59e0b"} />;
        case "crown":
            return <CrownIcon {...iconProps} color={c1 ?? "#eab308"} />;
        case "heart":
            return <HeartIcon {...iconProps} color={c1 ?? "#f43f5e"} />;
        case "star":
            return <StarIcon {...iconProps} color={c1 ?? "#fbbf24"} />;
        case "custom":
        case "sparkles":
            return <WandSparklesIcon {...iconProps} color={c1 ?? "#a855f7"} />;
        default:
            return <HeartIcon {...iconProps} color={c1 ?? "#f43f5e"} />;
    }
}
