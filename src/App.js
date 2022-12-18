import { useState, useEffect, useMemo, useRef } from 'react'

import photos from './photos.json'

import './App.css'

const Row = ({ index, style }) => {
	const [value, setValue] = useState('State')
	const [counter, setCounter] = useState(0)
	const pussyRef = useRef(null)

	useEffect(() => {
		setInterval(() => {
			setCounter((prevState) => prevState + 1)
			setValue(Math.random())
		}, 1000)
	}, [])

	useEffect(() => {
		if (!pussyRef.current) return

		pussyRef.current.innerHTML += 'PUSSY'
	}, [value, counter])

	return (
		<div style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
			<div>id: {photos[index].id}</div>
			<div>title: {photos[index].title}</div>
			<div>url: {photos[index].url}</div>
			<div>: {photos[index].albumId}</div>
			<div>: {photos[index].thumbnailUrl}</div>
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			<div>time: {counter}</div>
			<div ref={pussyRef} />
		</div>
	)
}

function App() {
	return (
		<VirtualizedList height={550} itemCount={5000} itemSize={21} offset={30}>
			{({ index, style }) => <Row key={index} index={index} style={style} />}
		</VirtualizedList>
	)
}

const VirtualizedList = ({
	height,
	itemSize,
	itemCount,
	children,
	offset = 0,
}) => {
	const [indexes, setIndexes] = useState([])

	const parentRef = useRef(null)

	useEffect(() => {
		const scrollHandler = (e) => {
			const { target } = e
			const scrollTop = target.scrollTop
			let startIndex = Math.floor(scrollTop / itemSize)
			let endIndex = Math.floor((scrollTop + height) / itemSize)

			if (startIndex > 0) startIndex -= 1
			if (startIndex > offset - 1) startIndex -= offset - 1

			if (endIndex + offset < itemCount) endIndex += offset

			if (endIndex > itemCount) return

			let array = []

			for (let i = startIndex; i < endIndex; i++) array.push(i)

			setIndexes(array)
		}

		parentRef.current.addEventListener('scroll', scrollHandler, true)
	}, [parentRef])

	useEffect(() => {
		const lastIndex = Math.floor(height / itemSize)

		let array = []

		for (let i = 0; i < lastIndex; i++) array.push(i)

		setIndexes(array)
	}, [])

	return (
		<div
			ref={parentRef}
			style={{
				position: 'relative',
				height,
				overflow: 'auto',
				willChange: 'transform',
			}}
		>
			<div style={{ height: itemCount * itemSize }}>
				{indexes.map((index) =>
					children({
						style: {
							position: 'absolute',
							left: 0,
							// top: index * itemSize,
							transform: `translateY(${index * itemSize}px)`,
							height: itemSize,
							width: '100%',
						},
						index,
					})
				)}
			</div>
		</div>
	)
}

export default App
