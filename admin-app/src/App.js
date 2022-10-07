import "./App.css";
import "./css/custom.css";
import "./css/style.default.css";

import { BrowserRouter, Route, Switch } from "react-router-dom";

import Footer from "./Share/Footer/Footer";
import Header from "./Share/Header/Header";
import SignIn from "./Authentication/SignIn";
import SignUp from "./Authentication/SignUp";
import Chat from "./Chat/Chat";
import Products from "./Products/Products";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Switch>
          <Route exact path="/" component={Chat} />{" "}
          <Route exact path="/products" component={Products} />{" "}
          {/* <Route path='/detail/:id' component={Detail} />{' '}
					<Route path='/cart' component={Cart} />{' '} */}
          <Route path="/signin" component={SignIn} />{" "}
          <Route path="/signup" component={SignUp} />{" "}
          {/* <Route path="/checkout" component={Checkout} />{" "} */}
          {/* <Route path='/history' component={History} />{' '}
					<Route path='/shop' component={Shop} /> */}
        </Switch>{" "}
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
