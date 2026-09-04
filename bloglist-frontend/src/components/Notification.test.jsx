import { render, screen } from '@testing-library/react'
import Notification from './Notification'

test('renders content', () => {
  const message = 'Component testing is done with react-testing-library'

  render(<Notification message={message} />)

  const element = screen.getByText('Component testing is done with react-testing-library')
  expect(element).toBeDefined()
})