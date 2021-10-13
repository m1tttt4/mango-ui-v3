import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'
import FloatingElement from '~/components/FloatingElement'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`

export const FlipCard = styled.div`
  background-color: transparent;
  height: 100%;
  perspective: 1000px;
`

export const FlipCardInner = styled.div<any>`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s ease-out;
  transform-style: preserve-3d;
  transform: ${({ flip }) => (flip ? 'rotateY(0deg)' : 'rotateY(180deg)')};
`

export const FlipCardFront = styled.div`
  width: 100%;
  @media screen and (min-width: 768px) {
    height: 100%;
    position: absolute;
  }
`

export const FlipCardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotateY(180deg);
`

export const StyledFloatingElement = styled(FloatingElement)`
  animation: ${css`
    ${fadeIn} 1s linear
  `};
`
