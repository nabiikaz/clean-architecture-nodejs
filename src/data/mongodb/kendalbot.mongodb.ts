import { Model } from 'mongoose';
import { KendalBotRepository } from '../../usecases/repository/kendalbot.repository';
import { KendalBotResponse, KendalBotOption } from '../../entities/entity/kendalbot.entity';
import { KendalBotDto, removeSpacesBlank } from '../../entities/dto/kendalbot.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IKendal } from '../../entities/interfaces/kendal.interfaces';

export class KendalBotMongoDB implements KendalBotRepository {
    constructor(@InjectModel('Kendal') private readonly kendalModel: Model<IKendal>) { }

    async chatBot(kendalBotDto: KendalBotDto): Promise<KendalBotResponse> {
        const messagebot = removeSpacesBlank(kendalBotDto.inputmessage);
        const kendalbasic = await this.kendalModel
            .findOne({ input: messagebot })
            .lean();

        if (kendalbasic) {
            const kendalresponse = new KendalBotResponse(kendalbasic.output);
            const options = await this.kendalModel
                .find({ parentid: kendalbasic._id })
                .lean();
            options.forEach(item => {
                kendalresponse.options
                    .push(new KendalBotOption(item.title, item.input));
            });
            return kendalresponse;
        } else {
            const splitinput = messagebot.split(' ');
            const kendals = await this.kendalModel
                .find({ keywords: { $in: splitinput } })
                .lean();
            if (kendals.length > 0) {
                const helpunderstand = await this.kendalModel
                    .findOne({ keywords: 'helpunderstand' })
                    .lean();
                const kendalresponse = new KendalBotResponse(helpunderstand.output);
                kendals.forEach(kendal => {
                    kendalresponse.options
                        .push(new KendalBotOption(kendal.title, kendal.input));
                });
                return kendalresponse;
            }
            const understand = await this.kendalModel
                .findOne({ keywords: 'notunderstand' })
                .lean();
            return new KendalBotResponse(understand.output);
        }
    }
}
