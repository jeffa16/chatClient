import { Pipe, PipeTransform } from '@angular/core';
import { tokenName } from '@angular/compiler';
import { filter } from 'rxjs/operators';

@Pipe({
  name: 'topicFilter'
})
export class TopicFilterPipe implements PipeTransform {

  checkTo(toName, filter) {
    console.log(toName.message.to + " " + filter + " "+ toName.message.from);
    if(toName.message.to == filter || toName.message.from == filter) {
      console.log("Adding a value");
      return toName;
    }
    return;
  }

  transform(items: any[], filter: Object): any {
    if (!items || !filter) {
        return items;
    }
    
    

    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter( (item) => this.checkTo(item, filter));

}
}
