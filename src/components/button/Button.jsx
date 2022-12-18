import Text from './Text'
import Counter from './Counter'
import Icon from './Icon'

const Button = ({ children, onClick, className }) => {
	const onClickHandler = () => {
		onClick()
	}

	return (
		<button onClick={onClickHandler} className={`button ${className}`}>
			{children}
		</button>
	)
}

Button.Text = Text
Button.Counter = Counter
Button.Icon = Icon

export default Button
