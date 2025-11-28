import { TextInputCompTypes } from '../types'

export default function TextInput({
  string,
  inputType,
  placeholder,
  error,
  onUpdate,
}: TextInputCompTypes) {
  return (
    <>
      <input
        placeholder={placeholder}
        className="block w-full rounded-md border border-gray-300 bg-[#F1F1F2] px-3 py-2.5 text-gray-800 focus:outline-none"
        value={string || ''}
        onChange={event => onUpdate(event.target.value)}
        type={inputType}
        autoComplete="off"
      />

      <div className="text-[14px] font-semibold text-red-500">{error ? error : null}</div>
    </>
  )
}
