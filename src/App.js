import { useState, useRef, useEffect, useCallback, useMemo } from "react";

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

	const [itemCount, setItemCount] = useState(30);

	return (
		<div style={{ display: "flex", gap: "100px" }}>
			<button onClick={() => setItemCount((prev) => (prev += 5))}>click</button>
			<div style={{ width: "500px" }}>
				<VirtualizedList
					height={580}
					itemCount={itemCount}
					itemSize={176}
					pageSize={10}
					onNewPage={({ startIndex, endIndex }) => {
						// console.log({ startIndex, endIndex });
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
	pageSize,
	onNewPage,
	onScroll,
}) => {
	const [indexes, setIndexes] = useState([]);
	const [startIndexPage, setStartIndexPage] = useState(0);
	const [endIndexPage, setEndIndexPage] = useState(
		itemCount < pageSize ? itemCount - 1 : pageSize - 1
	);
	const parentRef = useRef(null);
	const [scrollTop, setScrollTop] = useState(parentRef.current ?? 0);

	const startIndex = Math.floor(scrollTop / itemSize);
	const endIndex = Math.floor((scrollTop + height) / itemSize);
	const itemsInView = useMemo(
		() => Math.ceil(height / itemSize),
		[height, itemSize]
	);

	useEffect(() => {
		const parent = parentRef.current;
		if (!parent) return;

		const scrollObserver = (e) => {
			const target = e?.target;
			const scrollTop = target?.scrollTop || 0;

			setScrollTop(scrollTop);
		};

		parent.removeEventListener("scroll", scrollObserver, true);
		parent.addEventListener("scroll", scrollObserver, true);

		return () => {
			parent.removeEventListener("scroll", scrollObserver, true);
		};
	}, [parentRef]);

	useEffect(() => {
		onNewPage?.({ startIndex: startIndexPage, endIndex: endIndexPage });
	}, [startIndexPage, endIndexPage, itemCount]);

	// trigger scroll on adding new items, so it can recalculate all positions
	useEffect(() => {
		const parent = parentRef.current;
		if (!parent) return;

		parent.scrollTo(0, parent.scrollTop - 1);
		parent.scrollTo(0, parent.scrollTop + 1);
	}, [itemCount]);

	// render list
	useEffect(() => {
		const offset = pageSize - itemsInView;
		const thereIsLessThanOffsetItems = () => itemCount - endIndex < offset;
		const remainingElements = endIndex + (itemCount - endIndex);
		const defaultOffset = endIndex + offset;

		const endRenderIndex = thereIsLessThanOffsetItems()
			? remainingElements
			: defaultOffset;

		let array = [];
		for (let i = startIndex; i <= endRenderIndex; i++) {
			if (i === itemCount) break;
			array.push(i);
		}
		setIndexes(array);
	}, [itemCount, startIndex, endIndex]);

	// scroll up
	useEffect(() => {
		const userScrolledUp = () => startIndex < startIndexPage;
		const notStartPage = () => startIndex !== 0;

		if (userScrolledUp() && notStartPage()) {
			setStartIndexPage((prev) => prev - pageSize);
			setEndIndexPage((prev) => {
				const notEnoughElementsForFullPage = () => itemCount % pageSize !== 0;
				const lastPage = () => prev === itemCount - 1;

				if (notEnoughElementsForFullPage() && lastPage()) {
					return prev - (prev - startIndexPage) - 1;
				}
				return prev - pageSize;
			});
		}
	}, [itemCount, pageSize, startIndex, startIndexPage]);

	// scroll down
	useEffect(() => {
		if (endIndexPage - startIndex < 0) {
			setStartIndexPage((prev) => prev + pageSize);
			setEndIndexPage((prev) => {
				const notEnoughElementsForFullPage = () =>
					prev + pageSize > itemCount - 1;

				if (notEnoughElementsForFullPage()) {
					return prev + (itemCount - prev - 1);
				}
				return prev + pageSize;
			});
		}
	}, [startIndex, endIndexPage, pageSize, itemCount]);

	// check if scroll is not big enough to scroll to the next page
	useEffect(() => {
		const cannotBeScrolledToNextPage = () =>
			itemCount - (endIndexPage + 1) < itemsInView;
		const preventInfiniteLoop = () => endIndexPage < itemCount - 1;

		if (cannotBeScrolledToNextPage() && preventInfiniteLoop()) {
			setEndIndexPage((prev) => prev + (itemCount - 1 - prev));
		}
	}, [endIndexPage, itemCount, itemsInView]);

	onScroll?.({ startIndex, endIndex });

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
