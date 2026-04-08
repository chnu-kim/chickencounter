import { useChickenCount } from './hooks/useChickenCount'
import { MainCounter } from './components/MainCounter'
import { Milestone } from './components/Milestone'
import { StatusMessage } from './components/StatusMessage'
import { Details } from './components/Details'
import './App.css'

function App() {
  const data = useChickenCount()

  return (
    <div className="page">
      <main className="hero">
        <h1 className="hero__title">치킨 적립 현황</h1>
        <MainCounter count={data.count} totalPrice={data.totalPrice} />
        <StatusMessage isTuesday={data.isTuesday} />
        <Milestone totalPrice={data.totalPrice} />
      </main>

      <footer className="footnote">
        <Details startDate={data.startDate} excludedDay={data.excludedDay} />
        <p className="footnote__update">매일 오후 9시 5분 기준 자동 갱신</p>
      </footer>
    </div>
  )
}

export default App
