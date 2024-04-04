import {
	useState,
	useRef,
	useLayoutEffect,
	useEffect,
	useCallback,
} from "react";

// import photos from "./photos.json";

import "./App.css";

const Row = ({ index, style }) => {
	const [value, setValue] = useState("State");
	// const [counter, setCounter] = useState(0);

	// useEffect(() => {
	// 	setInterval(() => {
	// 		setCounter((prevState) => prevState + 1);
	// 		setValue(Math.random());
	// 	}, 1000);
	// }, []);

	return (
		<div style={{ ...style, display: "flex", flexWrap: "wrap", gap: 10 }}>
			<div>id: {index}</div>
			{/* <div>title: {photos[index].title}</div>
			<div>url: {photos[index].url}</div>
			<div>: {photos[index].albumId}</div>
			<div>: {photos[index].thumbnailUrl}</div> */}
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			{/* <div>time: {counter}</div> */}
		</div>
	);
};

function App() {
	const [list, setList] = useState([]);
	const [fullList, setFullList] = useState(() => {
		const list = [];
		for (let i = 0; i < 9999; i++) list.push(i);
		return list;
	});

	return (
		<div style={{ display: "flex", gap: "100px" }}>
			<div style={{ width: "500px" }}>
				<VirtualizedList
					height={860}
					itemCount={100}
					itemSize={176}
					pageSize={5}
					onNewPage={({ startIndex, endIndex }) => {
						console.log(startIndex, endIndex);
						setList(fullList.slice(startIndex, endIndex + 1));
					}}
				>
					{({ index, style }) => (
						<Row key={index} index={index} style={style} />
					)}
				</VirtualizedList>
			</div>
			<div>
				{list.map((i) => (
					<div key={i}>{i}</div>
				))}
			</div>
		</div>
	);
}

const VirtualizedList = ({
	height,
	itemSize,
	itemCount,
	children,
	onScroll,
	onNewPage,
	pageSize,
}) => {
	const itemsInView = useRef(Math.round(height / itemSize));
	const offset = useRef(
		pageSize - itemsInView.current <= 0 ? 0 : pageSize - itemsInView.current
	);
	const calculatedPageSize = useRef(itemsInView.current + offset.current);

	const [indexes, setIndexes] = useState([]);
	const [startIndexPage, setStartIndexPage] = useState(0);
	const [endIndexPage, setEndIndexPage] = useState(
		() => calculatedPageSize.current
	);

	// fix this moment and check if it render item count 5 page size 10
	console.log("awdawd", Math.floor((itemSize * itemCount) / itemSize) - 1);

	// console.log({ startIndexPage, endIndexPage });

	const parentRef = useRef(null);

	const getItemsInView = useCallback(
		(e) => {
			const target = e?.target;
			const scrollTop = target?.scrollTop || 0;
			let startIndex = Math.floor(scrollTop / itemSize);
			let endIndex =
				itemSize * itemCount < height
					? Math.floor((itemSize * itemCount) / itemSize)
					: Math.floor((scrollTop + height) / itemSize);

			// console.log(height);
			// console.log(itemSize * itemCount);
			// console.log(Math.floor((itemSize * itemCount) / itemSize));
			// console.log(Math.floor((scrollTop + height) / itemSize));

			if (endIndex > itemCount) return;

			endIndex +=
				itemCount - endIndex < offset.current
					? itemCount - endIndex
					: offset.current;

			// console.log({ startIndex, endIndex });

			// scroll up
			if (startIndex < startIndexPage && startIndex !== 0) {
				console.log("scroll up");
				setStartIndexPage((prev) => prev - calculatedPageSize.current);
				setEndIndexPage((prev) => {
					if (
						itemCount % calculatedPageSize.current !== 0 &&
						prev === itemCount
					) {
						return prev - (prev - startIndexPage);
					}

					return prev - calculatedPageSize.current;
				});
			}

			// scroll down
			if (endIndexPage - startIndex <= 0) {
				console.log("scroll down");
				setStartIndexPage((prev) => prev + calculatedPageSize.current);
				setEndIndexPage((prev) => {
					const newIndex = prev + calculatedPageSize.current;
					if (newIndex > itemCount) return prev + itemCount - prev;
					if (
						(itemCount - newIndex) * itemSize <=
						itemsInView.current * itemSize
					) {
						return newIndex + (itemCount - newIndex);
					}
					return newIndex;
				});
			}

			onScroll?.({ startIndex, endIndex });

			let array = [];

			for (let i = startIndex; i <= endIndex; i++) {
				if (i === itemCount) break;
				array.push(i);
			}
			setIndexes(array);
		},
		[itemSize, height, itemCount, startIndexPage, endIndexPage]
	);

	useLayoutEffect(() => {
		// const parent = parentRef.current;
		// if (!parent) return;

		getItemsInView();

		// parent.scrollTo(1, 1);
		// parent.scrollTo(0, 0);
	}, []);

	useLayoutEffect(() => {
		const parent = parentRef.current;
		if (!parent) return;

		parent.removeEventListener("scroll", getItemsInView, true);
		parent.addEventListener("scroll", getItemsInView, true);

		return () => {
			parent.removeEventListener("scroll", getItemsInView, true);
		};
	}, [parentRef, getItemsInView, itemSize, height, itemCount]);

	useEffect(() => {
		// console.log({ endIndexPage });

		// let endIndex = endIndexPage === itemCount ? endIndexPage : endIndexPage - 1;
		let endIndex =
			endIndexPage === itemCount ? endIndexPage - 1 : endIndexPage - 1;

		// console.log({ startIndexPage, endIndexPage });

		if (itemCount === 0) return;
		// if (pageSize > itemCount) {
		// 	console.log({ pageSize });
		// 	console.log({ itemCount });
		// }

		onNewPage?.({
			startIndex: startIndexPage,
			endIndex,
		});
	}, [endIndexPage, startIndexPage]);

	// console.log({ startIndexPage, endIndexPage });

	return (
		<div
			ref={parentRef}
			style={{
				position: "relative",
				height,
				overflow: "auto",
				willChange: "transform",
			}}
		>
			<div style={{ height: itemCount * itemSize }}>
				{indexes.map((index) =>
					children({
						style: {
							position: "absolute",
							left: 0,
							transform: `translateY(${index * itemSize}px)`,
							height: itemSize,
							width: "100%",
						},
						index,
					})
				)}
			</div>
		</div>
	);
};

export default App;
