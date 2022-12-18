import { memo } from 'react'

const Text = ({ children }) => {
	return <span style={{ color: 'cyan', fontWeight: 900 }}>{children}</span>
}

export default memo(Text)
