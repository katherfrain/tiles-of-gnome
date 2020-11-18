import React from 'react'

export default function UILine({label, value}) {
  return (
    <div className="ui-line">
      <span className="ui-label">{label}</span>
      <span className="ui-value">{value}</span>
    </div>
  )
}
