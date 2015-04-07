import Ampere from "../src/ampere";
import Constants from "../src/constants";

describe("Ui", ()=>{
  it("is available in Constants.UI and can be accessed via Ampere", ()=>{
    expect(Constants.UI).not.toBe(undefined);
    expect(Constants.UI).toBe(Ampere.UI);
  });

  describe("caption", ()=>{
    it("todo",done=>{
      done();
    });
  });

  describe("icon", ()=>{
    it("todo",done=>{
      done();
    });
  });

  describe("description", ()=>{
    it("todo",done=>{
      done();
    });
  });

  describe("hotkey", ()=>{
    it("todo",done=>{
      done();
    });
  });
});
