
import { useState } from 'react'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Button as MuiButton,
  Card as MuiCard,
  TextField as MuiTextField,
  IconButton,
  InputAdornment,
} from '@mui/material'

const styles = {
  '&:hover': {
    bgcolor: 'rgba(90, 250, 130, 0.5)'
  },
  color: 'inherit',
  bgcolor: 'rgba(0, 170, 40, 0.5)',
  m: 1
}
const cardStyle = ({
  padding: 5,
  border: '10px solid transparent'
})

export const Button = (props) =>
  <MuiButton {...props} sx={styles} />

export const Card = (props) =>
  <MuiCard {...props} elevation={2} style={cardStyle}></MuiCard>

export const TextField = (props) =>
  <MuiTextField {...props} variant="standard" autoComplete="off"
    sx={{ m: 1, width: '50ch' }} />

export const UsernameTextField = (props) =>
  <MuiTextField {...props} variant="standard" type="username" />

export const PasswordTextField = (props) => {
  const [showPassword, setShowPassword] = useState(true)
  const handleClickShowPassword = () => setShowPassword((show) => !show)

  return <MuiTextField {...props}
    variant="standard"
    type={showPassword ? 'text' : 'password'} // toggle visibility
    slotProps={{
      input: {
        endAdornment: (<InputAdornment position="end">
          <IconButton
            aria-label={showPassword ? 'hide' : 'display'}
            onClick={handleClickShowPassword} edge="end">
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>),
      },
    }}
  />
}

export default { Button, Card, TextField, UsernameTextField, PasswordTextField }
