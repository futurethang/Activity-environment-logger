export default function Header() {
  return (
    <div className="flex justify-center mx-auto">
      <div className="flex justify-start items-center gap-6 mb-4">
        <img
          src="./images/brand-trans-sm.png"
          alt="ecopulse homesync logo"
          width={100}
          height={100}
        />
        <h1 className="text-blue-600 text-roboto">
          EcoPulse <span className="font-[400]">HomeSync</span>
        </h1>
      </div>
    </div>
  )
}
