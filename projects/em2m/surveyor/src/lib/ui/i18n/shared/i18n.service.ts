import {Injectable} from '@angular/core';
import {ContextService} from "../../../core/extension/context.service";

@Injectable()
export class Surveyori18nService {

  langKeys: any;

  constructor(private ctx: ContextService) {
    this.detectLang();
  }

  detectLang() {
    //TODO set up subscription
    this.langKeys = this.ctx.getValue("i18n");
  }

  translate(message: string, token?: string) {

    if (!this.langKeys) {
      this.detectLang();
    }

    let translation;

    if (!token && message) {
      //Case 1 - only message sent in... > remove () & special chars, handle vars,
      if (message.includes("(")) {
        const startingIndex = message.indexOf("(");
        const endingIndex = message.indexOf(")");
        token = message.slice(0, startingIndex) + message.slice(endingIndex + 1, message.length);
      } else {
        token = message;
      }

      //2 remove special chars
      token = token.replace(/[\.\-\:\']/g, "");

      if (token.includes("%")) {
        let tokenSplit = token.split(" ");
        let fullTranslation = [];

        // find index of element with variable marker - %
        tokenSplit.forEach((token, index) => {
          if (token.includes("%")) {
            //remove % then add to array
            fullTranslation.push(token.replace(/%/g, ""));
          } else if (token.trim() !== "") {
            //translate each element and re-insert into array
            let tokenTranslation = this.langKeys[token.toLowerCase()]?.translation || token;
            fullTranslation.push(tokenTranslation);
          }
        })

        return fullTranslation.join(" ");

      } else {
        //remove special chars && remove spaces
        token = token.split(" ").join("");
        translation = this.langKeys[token.toLowerCase()]?.translation || message;

        return translation;
      }
    } else if (token && message) {
      //token should be passed without vars, chars, etc
      //symbols, (), etc added back in translation
      token = token.split(" ").join("").replace(/[\.\-\:\']/g, "");
      translation = this.langKeys[token.toLowerCase()]?.translation || message;

      return translation || message;
    } else {
      return message;
    }
  }


}
