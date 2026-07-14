import styled from 'styled-components'
import '../App.css'
export const Title = styled.h1`
  font-size: var(--font-size-40);
  font-weight: var(--font-weight-600);
    
`

export const Button = styled.button`
  padding: var(--gap-5) var(--gap-25);       
  background-color: var(--primary);
  color: var(--white);
  font-size: var(--font-size-20);
  border: none;
  border-radius: var(--gap-5);
    

    &:hover {
        background-color: var(--dark-primary);
    }
`       
