import type { SVGIcon } from './SVGIcon'

export const CaretUpSharpCropped: SVGIcon = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 224" {...props}>
    <g transform="translate(-64,-144)">
      <path d="M448 368L256 144 64 368h384z" fill="currentColor" />
    </g>
  </svg>
)

// https://unpkg.com/ionicons@7.1.0/dist/svg/chevron-forward.svg
export const ChevronForwardFilled: SVGIcon = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="48"
      d="M184 112l144 144-144 144"
    />
  </svg>
)

// https://pictogrammers.com/library/mdi/icon/city
export const City: SVGIcon = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M19,15H17V13H19M19,19H17V17H19M13,7H11V5H13M13,11H11V9H13M13,15H11V13H13M13,19H11V17H13M7,11H5V9H7M7,15H5V13H7M7,19H5V17H7M15,11V5L12,2L9,5V7H3V21H21V11H15Z"
    />
  </svg>
)

// https://unpkg.com/ionicons@7.1.0/dist/svg/ellipse.svg
export const EllipseFilled: SVGIcon = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
    <path d="M256 464c-114.69 0-208-93.31-208-208S141.31 48 256 48s208 93.31 208 208-93.31 208-208 208z" />
  </svg>
)

// https://pictogrammers.com/library/mdi/icon/map-marker-star
export const MapMarkerStar: SVGIcon = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 2C8.1 2 5 5.1 5 9C5 14.2 12 22 12 22S19 14.2 19 9C19 5.1 15.9 2 12 2M14.5 13L12 11.5L9.5 13L10.2 10.2L8 8.3L10.9 8.1L12 5.4L13.1 8L16 8.3L13.8 10.2L14.5 13Z"
    />
  </svg>
)

// https://unpkg.com/ionicons@7.1.0/dist/svg/person.svg
export const PersonFilled: SVGIcon = props => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
    <path
      d="M332.64 64.58C313.18 43.57 286 32 256 32c-30.16 0-57.43 11.5-76.8 32.38-19.58 21.11-29.12 49.8-26.88 80.78C156.76 206.28 203.27 256 256 256s99.16-49.71 103.67-110.82c2.27-30.7-7.33-59.33-27.03-80.6zM432 480H80a31 31 0 01-24.2-11.13c-6.5-7.77-9.12-18.38-7.18-29.11C57.06 392.94 83.4 353.61 124.8 326c36.78-24.51 83.37-38 131.2-38s94.42 13.5 131.2 38c41.4 27.6 67.74 66.93 76.18 113.75 1.94 10.73-.68 21.34-7.18 29.11A31 31 0 01432 480z"
      fill="currentColor"
    />
  </svg>
)
