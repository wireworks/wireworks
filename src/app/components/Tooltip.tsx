import React from 'react';
import TooltipTrigger from 'react-popper-tooltip';
 
const Tooltip = ({children, tooltip, hideArrow, ...props}) => (
  <TooltipTrigger
    {...props}
    tooltip={({
      arrowRef,
      tooltipRef,
      getArrowProps,
      getTooltipProps,
      placement
    }) => (
      <div
        {...getTooltipProps({
          ref: tooltipRef,
          className: 'tooltip-container'
        })}
      >
        {!hideArrow && (
          <div
            {...getArrowProps({
              ref: arrowRef,
              className: 'tooltip-arrow',
              'data-placement': placement
            })}
          />
        )}
        {tooltip}
      </div>
    )}
  >
    {({getTriggerProps, triggerRef}) => (
      <span
        {...getTriggerProps({
          ref: triggerRef,
          className: 'trigger'
        })}
      >
        {children}
      </span>
    )}
  </TooltipTrigger>
);

export const TooltipBody = ({title, lines}) => (
	<div className="tooltip-body">
		{title? <span className="tooltip-title">{title}</span> : ""}
		{lines? lines.map((line)=>{
			return <span className="tooltip-line">{line}</span>
		}) : "" }
	</div>
);

export default Tooltip;