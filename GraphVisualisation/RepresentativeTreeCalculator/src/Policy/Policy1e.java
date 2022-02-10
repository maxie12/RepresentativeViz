/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Policy;

import Contact.Contact;
import InfectionTreeGenerator.Event.Event;
import InfectionTreeGenerator.Graph.Infection.InfectionGraph;
import InfectionTreeGenerator.Graph.Infection.InfectionNode;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 *
 * @author MaxSondag
 */
public class Policy1e extends IndirectPolicy {

    double contactTimeBack;
    double isolationTimeSinceLastContact;

    public Policy1e(InfectionGraph ig, List<Event> events, HashMap<Integer, Set<Contact>> contactsFromUser, HashMap<Integer, Double> randomAppPercentages, double appPercentage, double contactTimeBack, double isolationTimeSinceLastContact) {
        super(ig, events, contactsFromUser, randomAppPercentages, appPercentage);
        this.contactTimeBack = contactTimeBack;
        this.isolationTimeSinceLastContact = isolationTimeSinceLastContact;
    }

    @Override
    protected TimeWindow getContactWindow(double symptomaticTime) {
        return new TimeWindow(symptomaticTime - contactTimeBack, symptomaticTime);
    }

    @Override
    public String getPolicyString() {
        int appI = (int) Math.round(appPercentage * 100);
        int contactI = (int) Math.round(contactTimeBack);
        int isoI = (int) Math.round(isolationTimeSinceLastContact);

        return "1e" + "X" + contactI + "Y" + isoI + "A" + appI;
    }

    @Override
    protected TimeWindow getIsolateWindow(double symptomaticTime, InfectionNode isolatedNode, InfectionNode symptomaticNode) {
        //get the last contactTime with the symptomaticNode
        if (isolatedNode == symptomaticNode) {
            //last contact with self is at time of becoming symptomatic
            return new TimeWindow(symptomaticTime, symptomaticTime + isolationTimeSinceLastContact);
        }

        //find last contact time
        double lastContactTime = -1;
        Set<Contact> contactsFromIsolatedNode = getContactsFromNodeIdInWindow(isolatedNode.id, getContactWindow(symptomaticTime));

        if (directReachableContactIds.contains(isolatedNode.id)) {//node is a direct contact
            for (Contact c : contactsFromIsolatedNode) {
                if (c.endNodeId == symptomaticNode.id) {
                    lastContactTime = Math.max(lastContactTime, c.time);
                }
            }
        } else {//secondary contact. Get last time they have been in contact with a direct contact  before symptomaticTime
            for (Contact c : contactsFromIsolatedNode) {
                int id = c.endNodeId;
                if (directReachableContactIds.contains(id)) {
                    lastContactTime = Math.max(lastContactTime, c.time);
                }
            }
        }
        assert (lastContactTime >= 0);
        return new TimeWindow(symptomaticTime, lastContactTime + isolationTimeSinceLastContact);
    }
}
