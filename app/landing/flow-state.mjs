export function moveFlowIndex(current, direction, length) {
  return (current + direction + length) % length;
}
