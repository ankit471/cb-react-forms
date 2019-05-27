import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import flow from "lodash/flow";
import { DragSource, DropTarget } from "react-dnd";

const cardSource = {
	beginDrag(props) {
		return {
			id: props.id,
			index: props.index
		};
	}
};

const cardTarget = {
	hover(props, monitor, component) {
		const dragIndex = monitor.getItem().index;
		const hoverIndex = props.index;

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return;
		}

		// Determine rectangle on screen
		const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

		// Get vertical middle
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

		// Determine mouse position
		const clientOffset = monitor.getClientOffset();

		// Get pixels to the top
		const hoverClientY = clientOffset.y - hoverBoundingRect.top;

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%
		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return;
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return;
		}

		// Time to actually perform the action
		props.moveItem(dragIndex, hoverIndex);

		// Note: we're mutating the monitor item here!
		// Generally it's better to avoid mutations,
		// but it's good here for the sake of performance
		// to avoid expensive index searches.
		monitor.getItem().index = hoverIndex;
	}
};

class PreviewItems extends Component {
	render() {
		const { item, removeItem, id, connectDragSource, connectDropTarget } = this.props;
		return (
			connectDragSource &&
			connectDropTarget &&
			connectDragSource(
				connectDropTarget(
					<div className="list-group-item mb-1">
						<span onClick={() => removeItem(id)}>
							<i className="fa fa-times" />{" "}
						</span>
						{item}
					</div>
				)
			)
		);
	}
}

export default flow(
	DragSource("item", cardSource, (connect, monitor) => ({
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	})),
	DropTarget("item", cardTarget, connect => ({
		connectDropTarget: connect.dropTarget()
	}))
)(PreviewItems);