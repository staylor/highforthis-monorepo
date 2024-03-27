import SwiftUI

struct TextBlock <Content: View>: View {
    var content: () -> Content
    
    init(@ViewBuilder content: @escaping () -> Content) { self.content = content }
    
    var body: some View {
        VStack(alignment: .leading) {
            content()
        }.frame(maxWidth: .infinity, alignment: .leading).padding()
    }
}

#Preview {
    ScrollView {
        TextBlock {
            Paragraph("I'm baby mumblecore 90's Brooklyn jean shorts tumblr twee mustache mlkshk grailed pickled ugh flexitarian. Listicle 90's yes plz Brooklyn hell of disrupt, thundercats jianbing distillery. Asymmetrical blackbird spyplane +1, pitchfork tofu fixie direct trade butcher. Church-key hashtag big mood, cupping helvetica marxism taiyaki actually shoreditch")
            Text("This is just text").bold()
            Paragraph("Sriracha shaman grailed blue bottle glossier echo park gluten-free kogi pug food truck poke meh subway tile. Gorpcore try-hard la croix, sriracha chicharrones master cleanse pok pok street art prism cornhole 90's austin lumbersexual vibecession. Twee letterpress palo santo cred, man braid taiyaki marxism scenester shaman. Meditation cardigan helvetica hammock actually vaporware williamsburg ethical gastropub art party portland activated charcoal kitsch. Knausgaard lumbersexual fit freegan shoreditch selvage jawn pork belly woke quinoa deep v pop-up squid meditation. Fam keffiyeh neutral milk hotel activated charcoal, pork belly single-origin coffee yuccie.")
            Paragraph("Chambray raw denim fit, praxis bitters solarpunk artisan big mood master cleanse tote bag palo santo. Cornhole jianbing tofu, marxism leggings truffaut wolf la croix pour-over butcher. Hexagon letterpress jianbing, cardigan iPhone twee squid tbh helvetica church-key fixie. Offal pabst DIY prism. Four dollar toast church-key selvage hella banjo vape JOMO. Ascot yuccie beard heirloom shoreditch raw denim.")
            Paragraph("Quinoa selfies chartreuse, four loko tote bag sus post-ironic gochujang glossier shoreditch retro scenester edison bulb pickled. Bicycle rights gochujang shabby chic pinterest, bespoke aesthetic readymade. Raw denim butcher heirloom VHS, tumeric irony enamel pin salvia gluten-free deep v authentic. Literally marfa palo santo ascot normcore twee kogi viral. Typewriter mlkshk vaporware four dollar toast green juice helvetica photo booth JOMO narwhal tilde DIY pabst VHS fanny pack truffaut.")
            Paragraph("Bruh leggings crucifix four loko shaman, authentic raw denim narwhal hashtag pug DIY occupy post-ironic paleo normcore. Banjo listicle iPhone before they sold out, vape everyday carry fashion axe schlitz pok pok affogato venmo small batch actually. Selvage vinyl occupy, tattooed schlitz stumptown tofu vape shoreditch readymade aesthetic pour-over solarpunk. Tousled activated charcoal irony stumptown fashion axe, next level fanny pack drinking vinegar bicycle rights enamel pin mlkshk. Mukbang vice fingerstache woke tumblr bicycle rights, whatever vibecession four loko coloring book gorpcore praxis.")
        }
    }
}
